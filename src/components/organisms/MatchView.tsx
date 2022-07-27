import * as React from "react";
import API from "../../api";

function Row(props) {
  return <div className = {`flex flex-row ${ props.color }`}>
    <>{ props.children }</>
  </div>;
}

function Rows(props) {
  return props.values.map(value => {
    const colorRow = (value["side"] === "buy") ? "bg-green-100" : "bg-red-100";
    const colorText = (value["side"] === "buy") ? "text-green-900" : "text-red-900";
    return <Row color = { colorRow }>
      <div className = "w-32">{ value["price"] }</div>
      <div className = "w-32">{ value["size"] }</div>
      <div className = { `w-32 ${ colorText }` }>{ value["side"] }</div>
      <div className = "w-32"> { value["time"] }</div>
    </Row>
  });
}

class MatchView extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { data : [] }
    this.handle_data = this.handle_data.bind(this);
    API.Coinbase.instance.subscribe_event_match(this.props.product, this.handle_data);
  }

  public override componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any) {
    API.Coinbase.instance.subscribe_event_match(nextProps.product, this.handle_data);
  }

  private handle_data(data) {
    this.setState({ data: data });
  }

  public render() {
    return <div className="bg-gray-100 flex flex-col divide-y divide-slate-300 grow-0 border border-gray-300">
      <Row color="bg-gray-100">
        <div className="w-32">Price</div>
        <div className="w-32">Size</div>
        <div className="w-32">Side</div>
        <div className="w-32">Time</div>
      </Row>
      <Rows values={this.state.data}/>
    </div>;
  }
}

export default MatchView;
