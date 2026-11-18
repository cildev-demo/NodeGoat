const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const { URL } = require("url");
const {
    environmentalScripts
} = require("../../config/config");

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
    "use strict";

    const profile = new ProfileDAO(db);

    const isHttpUrl = (value) => {
        if (typeof value !== "string" || value.length === 0) {
            return false;
        }
        try {
            const parsed = new URL(value);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch (err) {
            return false;
        }
    };

    this.displayProfile = (req, res, next) => {
        const {
            userId
        } = req.session;



        profile.getByUserId(parseInt(userId), (err, doc) => {
            if (err) return next(err);
            doc.userId = userId;

            doc.websiteSafe = isHttpUrl(doc.website);

            return res.render("profile", {
                ...doc,
                csrftoken: req.csrfToken(),
                environmentalScripts
            });
        });
    };

    this.handleProfileUpdate = (req, res, next) => {

        const {
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting
        } = req.body;

        const regexPattern = /^[0-9]+#$/;
        // Allow only numbers with a suffix of the letter #, for example: 'XXXXXX#'
        const testComplyWithRequirements = regexPattern.test(bankRouting);
        // if the regex test fails we do not allow saving
        if (testComplyWithRequirements !== true) {
            const firstNameSafeString = firstName;
            return res.render("profile", {
                updateError: "Bank Routing number does not comply with requirements for format specified",
                firstNameSafeString,
                lastName,
                ssn,
                dob,
                address,
                bankAcc,
                bankRouting,
                csrftoken: req.csrfToken(),
                environmentalScripts
            });
        }

        const {
            userId
        } = req.session;

        profile.updateUser(
            parseInt(userId),
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting,
            (err, user) => {

                if (err) return next(err);

                user.updateSuccess = true;
                user.userId = userId;

                return res.render("profile", {
                    ...user,
                    csrftoken: req.csrfToken(),
                    environmentalScripts
                });
            }
        );

    };

}

module.exports = ProfileHandler;
