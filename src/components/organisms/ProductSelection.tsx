import * as React from "react";

function ButtonListTickers(props) {
  return props.state.products.map(product => {
    return <div className = "flex flex-row p-2">
      <div className = "grow">{ product }</div>
      <button
        className = "bg-yellow-100 hover:bg-yellow-200 grow rounded-xl"
        onClick = { () => props.onChange(product) }
      >
        <>{ (props.state.focus === product) ? "subscribe" : "unsubscribe" }</>
      </button>
    </div>
  });
}

function ProductSelection(props) {
  return <div className = "bg-sky-100 border border-sky-300 divide-y divide-slate-300 w-96 h-96 p-2">
    <ButtonListTickers
      state = { props.state }
      onChange = { props.onChange }
    />
  </div>
}

export default ProductSelection;
