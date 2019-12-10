
module.exports = function(config) {
	return {
    // We process everything we know how to handle, plus images, css
		templateFormats: [
      "md",
      "njk",
      "html",
      "css",
      "png",
      "jpg",
      "gif"
    ],
    // Use Nunjucks for all templates
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    passthroughFileCopy: true,
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
	};
};