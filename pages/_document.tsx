// document for Next.js

import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { resetServerContext } from 'react-beautiful-dnd';

console.log('starting _document', new Date());
class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    resetServerContext();
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
