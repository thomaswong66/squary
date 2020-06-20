import React from 'react';
import { render } from 'react-dom';
import { QRCode } from 'react-qr-svg';

const styles = {
  root: {
    fontFamily: 'sans-serif',
  },
  h1: {
    textAlign: 'center',
  },
  qrcode: {
    textAlign: 'center',
  },
};

class QrCode extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div style={styles.root}>
        <div style={styles.qrcode}>
          <QRCode
            level="Q"
            style={{ width: 256 }}
            
            value= "http://localhost:3000/enteroomid/4"
          />
        </div>
      </div>
    );
  }
}

export default QrCode;