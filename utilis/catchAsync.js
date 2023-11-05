module.exports = (funcAsync)=>{
    return (req,res,next)=>{
        funcAsync(req,res,next).catch(next)
    }
}