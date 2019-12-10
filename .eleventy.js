
const scrape = require('html-metadata');

// Helper function to escape HTML
const escape = (unsafe) => {
  return (unsafe === null) ? null : 
    unsafe.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}



module.exports = function(config) {

  config.addNunjucksAsyncFilter("linkPreview", (link, callback) => {
    /*
    let hash = crypto.createHash('sha1').update(link).digest('hex');
    let file = path.join('_links', `${hash}.json`);
    */
    // Helper function to format links
    const format = (metadata) => {
      let domain = link.replace(/^http[s]?:\/\/([^\/]+).*$/i, '$1');
      let title = escape((metadata.openGraph ? metadata.openGraph.title : null) || metadata.general.title || "");
      let author = escape(((metadata.jsonLd && metadata.jsonLd.author) ? metadata.jsonLd.author.name : null) || "");
      let image = escape((metadata.openGraph && metadata.openGraph.image) ? (Array.isArray(metadata.openGraph.image) ? metadata.openGraph.image[0].url : metadata.openGraph.image.url) : null);
      let description = escape(((metadata.openGraph ? metadata.openGraph.description : "") || metadata.general.description || "").trim());
      
      if (description.length > 140) {
        description = description.replace(/^(.{0,140})\s.*$/s, '$1') + '…';
      }
      return  `<p class="lp"><a class="lp-img" href="${link}">` +
    //          (image ? `<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${image}" alt="${title}">` : '') +
              (image ? `<img src="${image}" alt="${title}">` : '') +
              `</a><a class="lp-met" href="${link}"><strong class="lp-ttl">${title}<br></strong><em class="lp-dsc">${description}</em>` +
              (author ? `<span class="lp-by">${author}</span>` : ``)+
              `<span class="lp-dom">${domain}</span></a></p>`.replace(/[\n\r]/g, ' ');
    }
    

/*    if (fs.existsSync(file)) {
      console.log(`[linkPreview] Using persisted data for link ${link}.`);
      fs.readFile(file, (err, data) => {
        if (err) callback("Reading persisted metadata failed", `<div style="color:#ff0000; font-weight:bold">ERROR: Reading persisted metadata failed</div>`);
        callback(null, format(JSON.parse(data.toString('utf-8'))));
      });
    } else {
      console.log(`[linkPreview] No persisted data for ${link}, scraping.`);*/
      scrape(link).then((metadata => {
        if (!metadata) callback ("No metadata", `<div style="color:#ff0000; font-weight:bold">ERROR: Did not receive metadata</div>`);
//        fs.writeFile(file, JSON.stringify(metadata, null, 2), (err) => { /* Ignore errors, worst case we parse the link again */ });
        callback(null, format(metadata)); 
      }));
  //  }  
  });

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