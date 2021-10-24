const crypto = require('crypto')
const User = require('../models/user');
const bcrypt = require('bcryptjs')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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');

const { validationResult } = require('express-validator/check')

// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');


// const transporter = nodemailer.createTransport(
//     sendgridTransport({
//         auth: {
//             api_key: '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'
//         }
//     }));



exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[1]
    //     .trim()
    //     .split('=')[1];
    let message = req.flash('error');
    console.log(message);
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldInput: {
            email:'',
            password: ''
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    });
};
exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10')
    // req.isLoggedIn = true;
    const email = req.body.email;
    const password = req.body.password;

    // Using the validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: 'Invalid email or password',
            oldInput: {
                email: email,
                password: password,

            },
            validationErrors:errors.array()

        });
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.')
                return res.redirect('/login')
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')
                        })
                    }
                    return res.status(422).render("auth/login", {
                        path: "/login",
                        pageTitle: "Login",
                        errorMessage: 'Invalid email or password',
                        oldInput: {
                            email: email,
                            password: password,
            
                        },
                        validationErrors:[]
            
                    });

                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login')
                })

        })
        .catch(err => {
            const error = new Error(err);
            error.httStatusCode = 500;
            return next(error)
          });};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });
    }


    return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {

            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save()
        })
        .then(result => {
            console.log(email)
            process.env.SENDGRID_API_KEY
            res.redirect('/login')
            const msg = {
                to: email, // Change to your recipient
                from: 'edw_say@hotmail.es', // Change to your verified sender
                subject: 'Registration',
                text: 'Thanks for your registration.',
                html: '<strong>Thanks for your registration.</strong>',
            }
            sgMail
                .send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                })

        })
        .catch(err => {
            const error = new Error(err);
            error.httStatusCode = 500;
            return next(error)
          });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/');
    })
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with this email.')
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                user.save()
            })
            .then(result => {
                res.redirect('/')
                // transporter.sendMail({
                //     to: req.body.email,
                //     from: 'edwinsay03@test.com',
                //     subject: 'Password reset',
                //     html: `
                //     <p>Your requested a password reset</p>reset
                //     <p>Click this <a href="https://localhost:3000/reset/${token}"></a></p>
                //     `
                // });

                const msg = {
                    to: req.body.email, // Change to your recipient
                    from: 'edw_say@hotmail.es', // Change to your verified sender
                    subject: 'Password Reset',
                    text: 'and easy to do anywhere, even with Node.js',
                    html: `<p>You requested a password reset</p>
                            <p>Click this <a href="https://tranquil-reaches-00489.herokuapp.com/reset/${token}">Link</a> to set a new password</p>
                    `,
                }
                sgMail
                    .send(msg)
                    .then(() => {
                        console.log('Email sent')
                    })
                    .catch((error) => {
                        console.error(error)
                    })

            })
            .catch(err => {
                const error = new Error(err);
                error.httStatusCode = 500;
                return next(error)
              });
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {

            let message = req.flash('error')
            if (message.length > 0) {
                message = message[0]
            } else {
                message = null
            }
            res.render("auth/new-password", {
                path: "/new-password",
                pageTitle: "New Password",
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httStatusCode = 500;
            return next(error)
          });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();

        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => {
            const error = new Error(err);
            error.httStatusCode = 500;
            return next(error)
          });


}