import * as React from "react";
import Organisms from "../components/organisms";
import API from "../api"

class Market extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      focus: "",
      products: ["BTC-USD", "ETH-USD", "XRP-USD", "LTC-USD"]
    }
    this.handle_change_product = this.handle_change_product.bind(this);
  }

  private handle_change_product(product) {
    if (this.state.focus !== "")
      API.Coinbase.instance.unsubscribe(this.state.focus);
    API.Coinbase.instance.subscribe(product);
    this.setState({ focus: product });
  }

  public render() {
    return <div className = "flex flex-row">
      <Organisms.ProductSelection
        state = { this.state }
        onChange = { this.handle_change_product }
      />
      <Organisms.PriceView product = { this.state.focus }/>
      <Organisms.MatchView product = { this.state.focus }/>
    </div>;
  }
}

export default Market;
