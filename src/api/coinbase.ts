const ASK = "sell";
const BID = "buy";
const TYPE_MATCHES = "matches";
const TYPE_ORDER_BOOKS = "orderBooks";
const WS_COINBASE = "wss://ws-feed.exchange.coinbase.com";
const SUBSCRIBE = "subscribe";
const UNSUBSCRIBE = "unsubscribe";
const MAX_LENGTH_QUEUE = 30;
const PRODUCT_ID = "product_id";
const WS_ERROR = "error";
const WS_OPEN = "open";
const WS_MESSAGE = "message";

class Coinbase {
  private static self : Coinbase;
  private readonly socket : WebSocket;
  private orderBooks = {};
  private matches = {};
  private reactUpdateHandlers = {};

  //############################################################################
  // Constructor
  //############################################################################

  private constructor() {
    this.socket = new WebSocket(WS_COINBASE);
    this.event_error();
    this.event_message();
    this.event_open();
  }

  //############################################################################
  // Getters & Setters, Property
  //############################################################################

  public static get instance() : Coinbase {
    if (!Coinbase.self)
      Coinbase.self = new Coinbase();
    return Coinbase.self;
  }

  public get is_connect() : boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  //############################################################################
  // Private Methods
  //############################################################################

  private event_message() {
    this.socket.addEventListener(WS_MESSAGE, (event) => {
      const data = JSON.parse(event.data);
      switch (data["type"]) {
      case "l2update":
        this.type_l2update(data);
        break;
      case "ticker":
        this.type_ticker(data);
        break;
      case "last_match":
      case "match":
        this.type_match(data);
        break;
      case "snapshot":
        this.type_snapshot(data);
        break;
      case "status":
        this.type_status(data);
        break;
      default:
        console.log(">>> Not Implement Yet: ", data["type"], data);
      }
    });
  }

  private event_error() {
    this.socket.addEventListener(WS_ERROR, event => {
      console.log(">>> Websocket Error: ", event);
    });
  }

  private event_open() {
    if (this.socket === undefined)
      return;
    this.socket.addEventListener(WS_OPEN, () => {
      console.log(">>> Connected");
    });
  }

  private react_auto_update_handler(type : string, ticker : string, data : any) {
    const time = new Date().getTime();
    if (this.reactUpdateHandlers[type] === undefined || this.reactUpdateHandlers[type][ticker] === undefined)
      return ;
    const delta = time - this.reactUpdateHandlers[type][ticker].refreshLeast;
    if (delta > this.reactUpdateHandlers[type][ticker].refreshRate) {
      this.reactUpdateHandlers[type][ticker].refreshLeast = time;
      this.reactUpdateHandlers[type][ticker].handle(data);
    }
  }

  private subscribe_event_wrapper(type : string, ticker : string, fun : Function) {
    const object = {
      handle: fun,
      refreshRate: 50,
      refreshLeast: new Date().getTime()
    };
    (this.reactUpdateHandlers[type] === undefined)
      ? this.reactUpdateHandlers[type] = { [ticker]: object }
      : this.reactUpdateHandlers[type][ticker] = object;
  }

  private subscription_management(type : string, ticker : string) {
    if (type === UNSUBSCRIBE) {
      delete this.orderBooks[ticker];
      delete this.matches[ticker];
    }
    this.socket.send(JSON.stringify({
      type: type,
      product_ids: [ticker],
      channels: ["level2", "matches"]
    }));
  }

  private type_l2update(data : any) {

    const ticker = data[PRODUCT_ID];
    if (this.orderBooks[ticker] === undefined) {
      return;

    }
    const changes = data["changes"][0];
    const side = changes[0];
    const price = changes[1];
    const size = changes[2];
    if (size === "0.00000000") {
      const index = this.orderBooks[ticker][side].findIndex(element => {
        return element[0] === price
      });
      if (index === -1)
        return;
      this.orderBooks[ticker][side].splice(index);
    } else
      this.orderBooks[ticker][side].push([price, size]);
    (side === BID)
      ? this.orderBooks[ticker][side].sort((a, b) => b[0] - a[0])
      : this.orderBooks[ticker][side].sort((a, b) => a[0] - b[0]);
    this.react_auto_update_handler(TYPE_ORDER_BOOKS, ticker, this.orderBooks[ticker]);
  }

  private type_match(data : any) {
    const ticker = data[PRODUCT_ID];
    const object = {
      price: data["price"],
      side: data["side"],
      size: data["size"],
      time: new Date(data["time"]).getTime()
    };
    (this.matches[ticker] === undefined)
      ? this.matches[ticker] = [object]
      : this.matches[ticker].unshift(object);
    if (this.matches[ticker].length > MAX_LENGTH_QUEUE)
      this.matches[ticker].splice(MAX_LENGTH_QUEUE + 1);
    this.react_auto_update_handler(TYPE_MATCHES, ticker, this.matches[ticker]);
  }

  private type_snapshot(data : any) {
    const ticker = data[PRODUCT_ID];
    this.orderBooks[ticker] = {
      sell: data["asks"].sort((a, b) => a[0] - b[0]),
      buy: data["bids"].sort((a, b) => b[0] - a[0])
    };
    this.react_auto_update_handler(TYPE_ORDER_BOOKS, ticker, this.matches[ticker]);
  }

  private type_status(data : any) {
    console.log(data)
  }

  private type_ticker(data : any) {
    console.log(data)
  }

  //############################################################################
  // Public Methods
  //############################################################################

  public close() {
    if (this.socket !== undefined)
      this.socket.close();
  }

  public subscribe(ticker : string) {
    if (this.is_connect)
      this.subscription_management(SUBSCRIBE, ticker);
  }

  public subscribe_event_match(ticker : string, fun : Function) {
    this.subscribe_event_wrapper(TYPE_MATCHES, ticker, fun);
  }

  public subscribe_event_order_book(ticker : string, fun : Function) {
    this.subscribe_event_wrapper(TYPE_ORDER_BOOKS, ticker, fun);
  }

  public unsubscribe(ticker : string) {
    if (this.is_connect)
      this.subscription_management(UNSUBSCRIBE, ticker);
  }
}

export default Coinbase;
