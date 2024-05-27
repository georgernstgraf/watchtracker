module.exports = {
  content: ['./**/*.html', './**/*.ejs', './**/*.js'], // paths to your html and js files
  css: ['./**/*.css'], // paths to your css files
  output: './dist/', // where the output should be stored
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
};
