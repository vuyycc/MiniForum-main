const express = require('express');
const router = express.Router();
const Space = require('../model/Space');

router.get('/:id',async (req, res) => {
    if(!req.params.id){
        res.status(400).send({messError: "not found id"})
    }
    const id = {_id: req.params.id}
    const spaces = await (await Space.findById(id)).populated({path: 'author'})
    res.json(spaces)
})


router.get('/',(req,res)=>{
    //let authId= req.authenticateUser._id
    //if(authId){
        return Space.find().exec((err,spaces)=>{
            if(err) throw err
            res.json(spaces)
            
        })
    //}
})

router.post('/add',(req,res)=>{
    let space = new Space({
        name: req.body.name,
        list_spaces: req.body.list_spaces,

    })
    space.save((err)=>{
        if(err) throw err;
        console.log('space save');
    })
    res.json(space)
})
module.exports = router;