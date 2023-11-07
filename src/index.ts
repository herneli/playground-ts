import { Dashboard } from "./dashboard/Dashboard";

const dashboard = new Dashboard("test");
dashboard.widgets.map((widget) => {
  console.log({
    id: widget.configuration.id,
    props: widget.props,
  });
});

console.log("Set variable counter1");
dashboard.setVariable("counter1", dashboard.variables.counter1 + 1);

console.log("Set variable counter2");
dashboard.setVariable("counter2", dashboard.variables.counter2 + 1);

dashboard.widgets.map((widget) => {
  console.log({
    id: widget.configuration.id,
    props: widget.props,
  });
});
