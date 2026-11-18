const MemosDAO = require("../data/memos-dao").MemosDAO;
const marked = require("marked");
const {
    environmentalScripts
} = require("../../config/config");

const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const unescapeHtml = (value) => String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const isSafeHttpUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (err) {
        return false;
    }
};

const renderer = new marked.Renderer();

renderer.link = (href, title, text) => {
    const rawUrl = unescapeHtml(href);

    if (!isSafeHttpUrl(rawUrl)) {
        return text;
    }

    const titleAttribute = title ? ` title="${escapeHtml(unescapeHtml(title))}"` : "";

    return `<a href="${escapeHtml(rawUrl)}"${titleAttribute}>${text}</a>`;
};

renderer.image = (href, title, text) => {
    const rawUrl = unescapeHtml(href);

    if (!isSafeHttpUrl(rawUrl)) {
        return "";
    }

    const titleAttribute = title ? ` title="${escapeHtml(unescapeHtml(title))}"` : "";

    return `<img src="${escapeHtml(rawUrl)}" alt="${escapeHtml(text)}"${titleAttribute}>`;
};

const renderMemo = (memo) => {
    const escapedMemo = escapeHtml(memo || "");
    return marked(escapedMemo, {
        sanitize: true,
        renderer
    });
};

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

            const memosList = docs.map((doc) => ({
                memoHtml: renderMemo(doc.memo)
            }));

            return res.render("memos", {
                memosList,
                userId: userId,
                csrftoken: req.csrfToken(),
                environmentalScripts
            });
        });
    };

}

module.exports = MemosHandler;
