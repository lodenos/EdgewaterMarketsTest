import * as React from "react";
import API from "../../api";

function Rows(props) {
  if (props.data === undefined)
    return null;
  return props.data.map((value, index) => {
    if (index < 30)
      return <span>{ value[0] }</span>
  });
}

function ColumnPrice(props) {
  const color = (props.side === "buy") ? "bg-green-100" : "bg-red-100";
  const text = (props.side === "buy") ? "Bid" : "Ask";
  return <div className = { `${ color } flex flex-col divide-y divide-slate-300` }>
    <div className = "flex flex-row justify-center">{ text }</div>
    <Rows data = { (props.data === undefined) ? undefined : props.data[props.side] }/>
  </div>;
}

class PriceView extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
    this.handle_data = this.handle_data.bind(this);
    API.Coinbase.instance.subscribe_event_order_book(this.props.product, this.handle_data);
  }

  public override componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any) {
    API.Coinbase.instance.subscribe_event_order_book(nextProps.product, this.handle_data);
  }

  private handle_data(data) {
    this.setState({ data: data });
  }

  public render() {
    return <div className="bg-sky-100 w-96 grid grid-cols-2 border border-gray-300">
      <ColumnPrice
        data={this.state.data}
        side="buy"
      />
      <ColumnPrice
        data={this.state.data}
        side="sell"
      />
    </div>;
  }
}

export default PriceView;
