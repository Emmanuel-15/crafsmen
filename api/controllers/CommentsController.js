/**
 * CommentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// const Comments = require('../models/Comments');
// import { isEmpty } from '@sailshq/lodash';
const CommentsManager = require('../services/CommentsManager');
const Utils = require('../services/Utils');

module.exports = {

    // getAllComments: function (req, res) {
    //     if (req.method != 'GET') res.badRequest(Utils.jsonErr("NOT_FOUND"));

    //     try {
    //         Comments.find({ is_active: true })
    //             .then(data => {
    //                 res.ok("ALL_COMMENTS", data)
    //             })
    //     } catch (err) {
    //         console.log("Exception ", err);
    //     }
    // },

    getComment: async function (req, res) {
        if (req.method != 'GET') res.badRequest(Utils.jsonErr("NOT_FOUND"));

        if (!req.param || req.param.length != 2)
            return res.badRequest(Utils.jsonErr('NO_PARAMS_FOUND'));

        let requirement_id = req.param('requirement_id');
        let step_comment = req.param('step_comment');

        if (isNaN(step_comment) || isNaN(requirement_id))
            return res.badRequest(Utils.jsonErr(`INVALID_ID`));

        try {
            await Comments.find({
                select: ['createdAt', 'id', 'comment_text', 'comment_type', 'is_attachment', 'file_path'],
                where: { step_comment: step_comment, requirement_id: requirement_id, is_active: true },
                sort: 'createdAt DESC', limit: 5
            }).populate('user_id')
                .exec((err, data) => {
                    if (err) res.badRequest(Utils.jsonErr(err));

                    if (data && Object.keys(data).length > 0)
                        res.ok('USER_DATA', data);
                    else
                        res.badRequest(Utils.jsonErr("NO_DATA_FOUND"));
                })

        } catch (err) {
            console.log("Exception: ", err)
        }
    },

    create: function (req, res) {
        if (req.method != 'POST') res.badRequest(Utils.jsonErr("NOT_FOUND"));

        if (!req.body || _.isEmpty(req.body))
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));

        let newComment = {
            requirement_id: req.body.requirement_id,
            user_id: req.user.id,
            comment_text: req.body.comment_text,
            comment_parent: false,
            step_comment: req.body.step_comment,
            comment_type: 0,
            is_active: true,
            is_attachment: false,
            file_path: '',
        }

        if (isNaN(newComment.requirement_id))
            return res.badRequest(Utils.jsonErr('REQUIREMENT_ID_MUST_BE_A_NUMBER'));

        if (isNaN(newComment.step_comment))
            return res.badRequest(Utils.jsonErr('STEP_COMMENT_MUST_BE_A_NUMBER'));

        CommentsManager
            .createComment(req, newComment)
            .then(() => {
                return res.ok("COMMENTED_SUCCESSFULLY");
            })
            .catch(err => {
                if (err.code == "E_EXCEEDS_UPLOAD_LIMIT")
                    return res.badRequest(Utils.jsonErr("UPLOAD_LIMIT_10MB"));

                return res.badRequest(Utils.jsonErr(err));
            })
    },

    update: async function (req, res) {
        if (req.method != 'PUT') res.badRequest(Utils.jsonErr("NOT_FOUND"));

        if (!req.body || _.isEmpty(req.body))
            return res.badRequest(Utils.jsonErr('EMPTY_BODY'));

        if (!req.param || req.param.length != 2)
            return res.badRequest(Utils.jsonErr('NO_PARAMS_FOUND'));

        let comment_id = req.param('comment_id');

        let updateComment = {
            comment_text: req.body.comment_text,
            comment_parent: req.body.comment_parent,
            requirement_id: req.body.requirement_id,
            step_comment: req.body.step_comment
        }

        if (isNaN(updateComment.requirement_id))
            return res.badRequest(Utils.jsonErr('REQUIREMENT_ID_MUST_BE_A_NUMBER'));

        if (isNaN(updateComment.comment_parent))
            return res.badRequest(Utils.jsonErr('COMMENT_PARENT_MUST_BE_A_NUMBER'));

        try {
            const check = await Comments.findOne({ id: comment_id, is_active: true, user_id: req.user.id });
            if (check == undefined) return res.badRequest(Utils.jsonErr('NO_COMMENT_FOUND_TO_BE_UPDATED'));

        } catch (err) {
            console.log("Exception: ", err);
        }

        const result = await Comments.updateOne({ id: comment_id, is_active: true, user_id: req.user.id }).set(updateComment);
        console.log("i am result:", result)
        if (result == undefined) return res.badRequest(Utils.jsonErr('UPDATE_FAILED'))

        return res.ok('COMMENT_UPDATED_SUCCESSFULLY');
    },

    delete: async function (req, res) {
        if (req.method != 'DELETE')
            res.badRequest(Utils.jsonErr("NOT_FOUND"));

        if (!req.param || _.isEmpty(req.param) == 0)
            return res.badRequest(Utils.jsonErr('EMPTY_PARAM'));

        if (isNaN(req.param('comment_id')))
            return res.badRequest(Utils.jsonErr("INVALID_ID"));

        try {
            const check = await Comments.findOne({ id: req.param('comment_id'), user_id: req.user.id, is_active: true });

            if (check == undefined)
                return res.badRequest(Utils.jsonErr('NO_COMMENT_FOUND_TO_BE_DELETED.'))

            await Comments.updateOne({ id: req.param('comment_id') }).set({ is_active: false })
                .then(() => {
                    res.ok("COMMENT_DELETED_SUCCESSFULLY")
                })

        } catch (err) {
            console.log("Exception: ", err)
        }
    }

};

