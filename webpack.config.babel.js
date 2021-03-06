import {resolve} from 'path';
import {
  DefinePlugin,
  LoaderOptionsPlugin,
  HotModuleReplacementPlugin,
  NamedModulesPlugin,
  NoEmitOnErrorsPlugin,
} from 'webpack';
import HTMLPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CleanPlugin from 'clean-webpack-plugin';
import BabiliPlugin from 'babili-webpack-plugin';
import ExtractTextPlugin, {extract} from 'extract-text-webpack-plugin';

const host = 'localhost';
const port = process.env.PORT || 3000;
const url = `http://${host}:${port}/`;

const src = 'src';
const dest = 'app';
const clean = [dest];
const copy = [
  {
    from: 'content',
  },
];

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: true,
    modules: true,
    localIdentName: '[name]__[local]___[hash:base64:5]',
  },
};

function config({dev} = {}) {
  const env = dev ? 'development' : 'production';

  return {
    devtool: dev ? 'eval-source-map' : 'hidden-source-map',
    entry: [
      ...(dev ? [
        `webpack-dev-server/client?${url}`,
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
      ] : []),
      'babel-polyfill',
      `./${src}/index.jsx`,
    ],
    output: {
      path: resolve(__dirname, dest),
      filename: `bundle${dev ? '' : '.[chunkhash]'}.js`,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: resolve(__dirname, src),
          loader: 'babel-loader',
          options: {
            cacheDirectory: dev,
            forceEnv: env,
          },
        },
        {
          test: /\.css$/,
          include: resolve(__dirname, src),
          use: dev ? [
            'style-loader',
            cssLoader,
          ] : extract({
            fallback: 'style-loader',
            use: cssLoader,
          }),
        },
      ],
    },
    plugins: [
      new CleanPlugin(clean),
      new CopyPlugin(copy),
      new HTMLPlugin({
        template: `${src}/template.ejs`,
        inject: false,
      }),
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      new LoaderOptionsPlugin({
        minimize: !dev,
        debug: dev,
        options: {
          context: __dirname,
        },
      }),
      ...(dev ? [
        new HotModuleReplacementPlugin(),
        new NamedModulesPlugin(),
        new NoEmitOnErrorsPlugin(),
      ] : [
        new ExtractTextPlugin({
          filename: `style${dev ? '' : '.[contenthash]'}.css`,
          allChunks: true,
        }),
        new BabiliPlugin(),
      ]),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
  };
}

export {
  config as default,
};
