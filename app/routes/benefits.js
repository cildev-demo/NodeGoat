const {
    BenefitsDAO
} = require("../data/benefits-dao");
const {
    UserDAO
} = require("../data/user-dao");
const {
    environmentalScripts
} = require("../../config/config");

function BenefitsHandler(db) {
    "use strict";

    const benefitsDAO = new BenefitsDAO(db);
    const userDAO = new UserDAO(db);

    const checkAdmin = (req, res, next, callback) => {
        if (!req.session.userId) {
            return res.redirect("/login");
        }

        return userDAO.getUserById(req.session.userId, (error, user) => {
            if (error) return next(error);

            if (!user || !user.isAdmin) {
                return res.redirect("/login");
            }

            return callback();
        });
    };

    this.displayBenefits = (req, res, next) => {
        return checkAdmin(req, res, next, () => {
            benefitsDAO.getAllNonAdminUsers((error, users) => {

                if (error) return next(error);

                return res.render("benefits", {
                    users,
                    user: {
                        isAdmin: true
                    },
                    environmentalScripts
                });
            });
        });
    };

    this.updateBenefits = (req, res, next) => {
        return checkAdmin(req, res, next, () => {
            const {
                userId,
                benefitStartDate
            } = req.body;

            benefitsDAO.updateBenefits(userId, benefitStartDate, (error) => {

                if (error) return next(error);

                benefitsDAO.getAllNonAdminUsers((error, users) => {
                    if (error) return next(error);

                    const data = {
                        users,
                        user: {
                            isAdmin: true
                        },
                        updateSuccess: true,
                        environmentalScripts
                    };

                    return res.render("benefits", data);
                });
            });
        });
    };
}

module.exports = BenefitsHandler;
