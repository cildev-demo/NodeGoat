const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;
const {
    environmentalScripts
} = require("../../config/config");

function AllocationsHandler(db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        const userId = req.session.userId;
        const rawThreshold = req.query.threshold;
        let threshold;

        if (rawThreshold !== undefined && rawThreshold !== null) {
            if (typeof rawThreshold === "string") {
                const thresholdText = rawThreshold.trim();
                if (thresholdText !== "") {
                    if (!/^\d+(\.\d+)?$/.test(thresholdText)) {
                        return res.status(400).send("Invalid threshold");
                    }
                    threshold = Number(thresholdText);
                }
            } else if (typeof rawThreshold === "number" && isFinite(rawThreshold)) {
                threshold = rawThreshold;
            } else {
                return res.status(400).send("Invalid threshold");
            }
        }

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);
            return res.render("allocations", {
                userId,
                allocations,
                environmentalScripts
            });
        });
    };
}

module.exports = AllocationsHandler;
