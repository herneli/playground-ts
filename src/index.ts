import { Dashboard } from "./dashboard/Dashboard";
import util from "util";

const dashboard = new Dashboard("test");

dashboard.widgets.map((widget) => {
  console.log({
    id: widget.configuration.id,
    props: widget.props,
  });
  // console.log(util.inspect(dashboard, { depth: null, colors: true }));
});

// console.log("Set variable counter2");
// dashboard.setVariables({ counter2: dashboard.variables.counter1 + 1 });

// console.log();

// console.log("Set variable counter1");
// dashboard.setVariables({ counter2: dashboard.variables.counter2 + 1 });

// dashboard.widgets.map((widget) => {
//   console.log({
//     id: widget.configuration.id,
//     props: widget.props,
//   });
// });
