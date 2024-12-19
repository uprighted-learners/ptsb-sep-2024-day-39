// middleware to timeout the request after 10 seconds
const timedOutMiddleware = () => {
    return (req, res, next) => {
        setTimeout(() => {
            res.status(408).json({
                success: false,
                message: 'Request timed out'
            }, 10000)
            next();
        })
    }
}
module.exports = timedOutMiddleware;