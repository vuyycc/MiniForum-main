const express = require('express')
const router = express.Router();
const Post = require('../model/Post')
const mongoose = require('mongoose')
const Comment = require('../model/Comment')
const constants = require('../constants')
const Space = require('../model/Space');
const User = require('../model/User');
// New Post

router.post('/add-post', constants.upload.single('imgVideo'), async (req, res) => {
    const authId = req.authenticateUser._id
    let post = new Post({
        _id: new mongoose.Types.ObjectId,
        title: req.body.title,
        imgVideo: req.file?.path,
        described: req.body.described,
        like: [],
        comment: [],
        space: req.body.space,
        author: req.body.author
    })
    console.log(post._id);
    if (authId) {
        await post.save((err) => {
            if (err) throw err;
            console.log('Post save successfully')
            Space.findByIdAndUpdate(post.space, {
                $push: { list_posts: post._id }
            }, { new: true }).exec((err, result) => {
                if (err) {
                    return res.status(422).json({ error: err })
                } 
            })
            //})} else {
            // res.status(400).send({messError:'You must login '})
            //}
        }
        )
        //User.findByIdAndUpdate(post.author, {
          //  $push: { userPost: post._id }
        //})
        res.json({ "data": post })
    }
    else {
        res.status(400).send({ messError: 'You must login ' })
    }
})


//Add Comment

router.post('/:id', async (req, res) => {
    const authId = req.authenticateUser._id
    let comments = new Comment({
        _id: new mongoose.Types.ObjectId(),
        content: req.body.content,
        author: authId
    })
    if (authId) {
        comments.save((err) => {
            if (err) throw err;
            console.log('Comment save successfully')
        })
        let idPost = { _id: req.params.id }
        let nowPost = await Post.findById(idPost)
        nowPost.comment = nowPost.comment || []
        const addUser = await nowPost.comment.push(comments._id)
        Post.findByIdAndUpdate(idPost, nowPost, { new: true }, function (err, result) {
            if (err) return res.send(err)
        })
    } else {
        res.status(400).send({ messError: 'You must login ' })
    }
    res.json({ "data": nowPost })
})

//Like

router.post('/like/:id', async (req, res,) => {
    let id = { _id: req.params.id }
    const authId = req.authenticateUser._id
    if (authId) {
        const liked = {
            _id: authId
        }
        var nowPost = await Post.findById(id)
        nowPost.like = nowPost.like || []
        const addUser = await nowPost.like.push(liked)
        Post.findByIdAndUpdate(id, nowPost, { new: true }, function (err, result) {
            if (err) return res.send(err)
        })
    } else {
        res.status(400).send({ messError: 'You must login ' })
    }

    res.json({ "data": nowPost })

})

//unLike

router.post('/unlike/:id', (req, res) => {
    const authId = req.authenticateUser._id
    Post.findByIdAndUpdate(req.params.id, {
        $pull: { like: authId }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        } else {
            res.json(result)
        }
    })
})
// Get Post by Id
router.get('/:id', async (req, res) => {
    const id = { _id: req.params.id }
    if (!id) {
        res.status(400).send({ messErr: 'not found id' })
    } else {
        const post = await (await Post.findById(id).populate([{ path: 'author', select: ['name', 'avatar'] }, { path: 'like', select: ['name', 'avatar'] }, { path: 'comment', populate: { path: 'author', select: ['name', 'avatar'] } }]))
        res.json({
            "message": "OK",
            "data": post
        })
    }
})
//Get all Post
router.get('/', (req, res) => {
    return Post.find().populate([{ path: 'author', select: ['name', 'avatar'] }, { path: 'like', select: ['name', 'avatar'] }, { path: 'comment', populate: { path: 'author', select: ['name', 'avatar'] } }]).exec((err, posts) => {
        if (err) throw err
        res.json(posts)
    })
})
//Update Post by Id
router.put('/:id', constants.upload.single('imgVideo'), (req, res) => {
    if (!req.params.id) {
        res.status(400).send({ messError: 'not found id' })
    }
    const authId = req.authenticateUser._id
    const id = { _id: req.params.id }
    if (authId) {
        const update = {
            _id: id,
            title: req.body.title,
            imgVideo: req.file.path,
            described: req.body.described,
            space: req.body.space,
        }
        Post.findByIdAndUpdate(id, update, { new: true }, function (err, result) {
            if (err) return res.send(err)
            res.json(result)
        })
    } else {
        res.status(400).send({ messError: 'You must login ' })
    }
})
//Delete Post
router.delete('/:id', async (req, res) => {
    if (!req.params.id) {
        res.status(400).send({ messError: "not found id" })
    }
    const id = { _id: req.params.id }
    const currentPost = await Post.findById(id)
    //let authId = req.authenticateUser._id
    //let role = req.authenticateUser.role
    //if (currentPost.author === authId || role === 'admin') {
    Post.findByIdAndDelete(id, function (err, result) {
        if (err) return res.send(err)
        res.json({
            mess: "Sucessful delete id:" + req.params.id
        })
    })
    //}
})



module.exports = router
