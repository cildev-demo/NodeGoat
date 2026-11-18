const MemosDAO = require("../data/memos-dao").MemosDAO;
const marked = require("marked");
const {
    environmentalScripts
} = require("../../config/config");

const SAFE_URL = /^https?:\/\//i;

function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeUrl(url) {
    return SAFE_URL.test(url) ? url : "#";
}

function renderMemo(memo) {
    const renderer = new marked.Renderer();
    const defaultLink = marked.Renderer.prototype.link;
    const defaultImage = marked.Renderer.prototype.image;

    renderer.link = (href, title, text) => defaultLink.call(renderer, safeUrl(href), title, text);
    renderer.image = (href, title, text) => defaultImage.call(renderer, safeUrl(href), title, text);

    return marked(escapeHtml(memo), {
        renderer: renderer,
        sanitize: true
    });
}

function memoViews(docs) {
    return docs.map((doc) => ({
        memoHtml: renderMemo(doc.memo)
    }));
}

function MemosHandler(db) {
    "use strict";

    const memosDAO = new MemosDAO(db);

    this.addMemos = (req, res, next) => {

        memosDAO.insert(req.body.memo, (err, docs) => {
            if (err) return next(err);
            this.displayMemos(req, res, next);
        });
    };

    this.displayMemos = (req, res, next) => {

        const {
            userId
        } = req.session;

        memosDAO.getAllMemos((err, docs) => {
            if (err) return next(err);
            return res.render("memos", {
                memosList: memoViews(docs),
                userId: userId,
                csrftoken: req.csrfToken(),
                environmentalScripts
            });
        });
    };

}

module.exports = MemosHandler;
