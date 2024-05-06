


const logout = async (req, res, next) => {
    try {
      // Remove the token from the cookie
      res.clearCookie('token');
  
      // Redirect to the login page
      res.redirect("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).ysend("Error logging out");
    }
  };


  module.exports = logout;
