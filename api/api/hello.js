
module.exports = (req, res) => {
  res.status(200).json({ 
    message: "Hello, world!",
    timestamp: new Date().toISOString()
  });
};