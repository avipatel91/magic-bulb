// import React from 'react';
import React from 'react';
import IconService from 'icon-sdk-js';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from 'semantic-ui-react';
import { IoMdRefresh } from 'react-icons/io';

import Light from './Light';
import { withMagicContext } from './helpers/magicProvider';

const { IconBuilder, IconConverter, HttpProvider } = IconService;
const httpProvider = new HttpProvider(
  'https://bicon.net.solidwallet.io/api/v3'
);
const iconService = new IconService(httpProvider);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Buttons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tx: '',
      color: 'white',
      loading: false,
      buttonLoading: '',
    };

    // I've just put these binding in the constructor
    // so as not to clock up the render method and they only
    // get called once during the lifetime of the component
    // this.handleActionClick = this.handleActionClick.bind(this);
    this.handlerSendTransaction = this.handlerSendTransaction.bind(this);
  }

  async componentDidMount() {
    await this.getTransaction();
  }

  async getTransaction() {
    const call = new IconBuilder.CallBuilder()
      .to('cxd9d1950dfdaad7fcc73a1803d1ea0fa0f6993a04')
      .method('get_color')
      .build();

    try {
      const result = await iconService.call(call).execute();
      // const response= await IconBuilder.Call(txObj);
      // console.log(result);
      this.setState({ color: result });
    } catch (err) {
      toast.error(err.rawMessage);
      // console.log(JSON.stringify(err));
    }
  }

  async handlerSendTransaction(key) {
    const {
      value: { loginData: isLoggedIn },
    } = this.props;
    if (!isLoggedIn) {
      toast.error('Please Login First!!');
      return;
    }
    this.setState({ loading: true, buttonLoading: key });

    try {
      const {
        value: { magic },
      } = this.props;
      const metadata = await magic.user.getMetadata();

      const txObj = new IconBuilder.CallTransactionBuilder()
        .from(metadata.publicAddress)
        .to('cxd9d1950dfdaad7fcc73a1803d1ea0fa0f6993a04')
        //   .value(IconAmount.of(2, IconAmount.Unit.ICX).toLoop())
        .stepLimit(IconConverter.toBigNumber(1000000))
        .nid(IconConverter.toBigNumber(3))
        .nonce(IconConverter.toBigNumber(1))
        .version(IconConverter.toBigNumber(3))
        .timestamp(new Date().getTime() * 1000)
        .method('set_color')
        .params({
          _color: key,
        })
        .build();
      // console.log("called")
      const txhash = await magic.icon.sendTransaction(txObj);

      // setTxHash(txhash);
      this.setState({
        tx: txhash,
        // color:.target.id
      });
      toast.success('Successfully sent tx to contract');
      // console.log(key)
      // console.log("transaction result", txhash);

      await sleep(3000);

      await this.getTransaction();
    } catch (err) {
      toast.error(err.rawMessage);
      // console.log(JSON.stringify(err));
    }

    this.setState({ loading: false, buttonLoading: '' });
  }

  render() {
    const { loading, buttonLoading, color, tx } = this.state;
    return (
      <>
        <div className="row d-flex justify-content-center mainContainer">
          <div className="col-md-12">
            <div className="row d-flex align-items-center justify-content-center buttonContainer">
              <Button
                color="red bulb-btn"
                disabled={loading}
                loading={loading && buttonLoading === 'RED'}
                className="m-4"
                onClick={() => this.handlerSendTransaction('RED')}
              >
                Red
              </Button>
              <Button
                color="green bulb-btn"
                disabled={loading}
                loading={loading && buttonLoading === 'GREEN'}
                className="m-4"
                onClick={() => this.handlerSendTransaction('GREEN')}
              >
                Green
              </Button>
              <Button
                color="blue bulb-btn"
                disabled={loading}
                loading={loading && buttonLoading === 'BLUE'}
                className="m-4"
                onClick={() => this.handlerSendTransaction('BLUE')}
              >
                Blue
              </Button>
              <Button
                color="yellow bulb-btn"
                disabled={loading}
                loading={loading && buttonLoading === 'YELLOW'}
                className="m-4"
                onClick={() => this.handlerSendTransaction('YELLOW')}
              >
                Yellow
              </Button>
            </div>

            <div className="row d-flex align-items-center justify-content-center bulb">
              <Light color={color} />
            </div>
            <div className="row d-flex align-items-center justify-content-center mb-2">
              <IoMdRefresh
                size={32}
                color="white"
                style={{ cursor: 'pointer' }}
                onClick={this.getTransaction}
              />
            </div>
            <div className="row d-flex align-items-center justify-content-center">
              {tx ? (
                <div>
                  <h2
                    style={{
                      color: 'white',
                      padding: '10px',
                      textAlign: 'center',
                    }}
                  >
                    Tx Hash:
                  </h2>
                  <div className="info">
                    <a
                      href={`https://bicon.tracker.solidwallet.io/transaction/${tx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tx}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="row d-flex align-items-center justify-content-center">
              {/* <Button style={refreshBtnStyle} onClick={this.getTransaction}>Refresh</Button> */}
            </div>
          </div>
        </div>
        <ToastContainer />
      </>
    );
  }
}

export default withMagicContext(Buttons);
