module.exports = function (app, passport, db, axios) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    const { ObjectId } = require('mongodb'); // Ensure this is at the top

    app.get('/profile', isLoggedIn, function (req, res) {
        db.collection('kit').find({ userId: req.user._id }).toArray((err, kits) => {
            if (err) return console.log(err);

            if (!kits || kits.length === 0) {
                return res.render('profile.ejs', {
                    user: req.user,
                    kits: []
                });
            }

            const allComponentIds = [];
            kits.forEach(kit => {
                if (kit.components && kit.components.length > 0) {
                    allComponentIds.push(...kit.components);
                }
            });


            const isValidObjectId = id => /^[0-9a-fA-F]{24}$/.test(id);
            const objectIds = allComponentIds
                .filter(isValidObjectId)
                .map(id => new ObjectId(id));

            db.collection('components').find({
                _id: { $in: objectIds }
            }).toArray((err, components) => {
                if (err) return console.log(err);


                const componentMap = {};
                components.forEach(comp => {
                    componentMap[comp._id.toString()] = {
                        name: comp.name,
                        image: comp.image, 
                        price: comp.price,
                        desc: comp.desc,
                        link: comp.link
                    };
                });


                const enhancedKits = kits.map(kit => ({
                    _id: kit._id,
                    name: kit.name || 'Untitled Kit',
                    components: kit.components.map(id => {
                        const data = componentMap[id] || {};
                        return {
                            id,
                            name: data.name || `Unknown Component (${id})`,
                            image: data.image || null,
                            desc: data.desc || null,
                            price: data.price || null,
                            link: data.link || null
                        };
                    })
                }));

                res.render('profile.ejs', {
                    user: req.user,
                    kits: enhancedKits
                });
            });
        });
    });


    // LOGNOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout(() => {
            console.log('User has signed out!')
        });
        res.redirect('/');
    });

    // kit board routes ===============================================================
    app.get('/build', isLoggedIn, function (req, res) {
        var userId = req.user._id
        db.collection('components').find().toArray((err, result) => {
            if (err) return console.log(err)
            res.render('build.ejs', {
                user: req.user,
                components: result
            })
        })
    });

    app.post('/kit', isLoggedIn, (req, res) => {
        const kitData = {
            userId: req.user._id,
            components: req.body.components,

        };

        db.collection('kit').find({ userId: req.user._id }).toArray((err, result) => {
            if (err) return console.log(err);

            if (result.length > 0) {

                kitData._id = result._id;

            }

            db.collection('kit').save(kitData, (err, result) => {
                if (err) return console.log(err);
                res.redirect('/profile');
            });
        });
    });

    // =============================================================================
    // AUTHENTICATE (FIRST login) ==================================================
    // =============================================================================

    // locally --------------------------------
    // login ===============================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the register page if there is an error
        failureFlash: true // allow flash kit
    }));

    // register =================================
    // show the register form
    app.get('/register', function (req, res) {
        res.render('register.ejs', { message: req.flash('registerMessage') });
    });

    // process the register form
    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the register page if there is an error
        failureFlash: true // allow flash kit
    }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function (req, res) {
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
        user.save(function (err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
