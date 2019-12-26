const fs = require("fs");
const crypto = require("crypto");
const scrape = require('html-metadata');
const path = require('path');

// Helper function to escape HTML
const escape = (unsafe) => {
  return (unsafe === null) ? null : 
    unsafe.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

const linkPreview = (link, callback) => {

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
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67.733 67.733"><path fill="#d0d0d0" d="M0 0h67.733v67.733H0z"/><path fill="#fff" d="M33.867 13.547a20.32 20.32 0 00-20.32 20.32 20.32 20.32 0 0020.32 20.32 20.32 20.32 0 0020.32-20.32H50.8A16.933 16.933 0 0133.867 50.8a16.933 16.933 0 01-16.934-16.933 16.933 16.933 0 0116.934-16.934z"/><path fill="#fff" d="M26.383 36.361l4.99 4.99 19.955-19.957 4.99 4.99V11.415H41.35l4.99 4.99L26.382 36.36"/></svg>' +
            (image ? `<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${image}" alt="${title}">` : '') +
//          Use the below line without lazy loading
//          (image ? `<img src="${image}" alt="${title}">` : '') +
            `</a><a class="lp-met" href="${link}"><strong class="lp-ttl">${title}<br></strong><em class="lp-dsc">${description}</em>` +
            (author ? `<span class="lp-by">${author}</span>` : ``)+
            `<span class="lp-dom">${domain}</span></a></p>`.replace(/[\n\r]/g, ' ');
  }
  
  // Hash the link URL (using SHA1) and create a file name from it
  let hash = crypto.createHash('sha1').update(link).digest('hex');
  let file = path.join('_links', `${hash}.json`);

  if (fs.existsSync(file)) {
    // File with cached metadata exists
    console.log(`[linkPreview] Using persisted data for link ${link}.`);
    fs.readFile(file, (err, data) => {
      if (err) callback("Reading persisted metadata failed", `<div style="color:#ff0000; font-weight:bold">ERROR: Reading persisted metadata failed</div>`);
      // Parse file as JSON, pass it to the format function to format the link
      callback(null, format(JSON.parse(data.toString('utf-8'))));
    });
  } else {
    // No cached metadata exists
    console.log(`[linkPreview] No persisted data for ${link}, scraping.`);
    scrape(link).then((metadata => {
      if (!metadata) callback ("No metadata", `<div style="color:#ff0000; font-weight:bold">ERROR: Did not receive metadata</div>`);
      // First, store the metadata returned by scrape in the file
      fs.writeFile(file, JSON.stringify(metadata, null, 2), (err) => { /* Ignore errors, worst case we parse the link again */ });
      // Then, format the link
      callback(null, format(metadata)); 
    }));
  }  
}

module.exports = function(config) {

  config.addNunjucksAsyncFilter("linkPreview", linkPreview);

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