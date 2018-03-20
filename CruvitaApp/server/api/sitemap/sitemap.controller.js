'use strict';

// Get a single sitemap
exports.show = function(req, res) {
 return res.download('server/sitemap/' + req.params.id, 'server/sitemap/' + req.params.id, function(err){
    if (err) {
      console.log(err);
      // Handle error, but keep in mind the response may be partially-sent
      // so check res.headersSent
    } else {
      // decrement a download credit, etc.
    }
  }); // Set disposition and send it.
};