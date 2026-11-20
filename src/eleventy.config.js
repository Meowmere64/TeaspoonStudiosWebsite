export default function (eleventyConfig) {
	// Output directory: _site

	// Copy `img/` to `_site/img/`
	eleventyConfig.addPassthroughCopy("css");

	eleventyConfig.addPassthroughCopy("images");
    eleventyConfig.addPassthroughCopy("fonts");

	// Copy any .jpg file to `_site`, via Glob pattern
	// Keeps the same directory structure.
	//eleventyConfig.addPassthroughCopy("**/*.jpg");


    //eleventyConfig.addGlobalData("layout", "base.njk")
};