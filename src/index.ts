import { Dashboard } from "./Dashboard";
import util from "util";

const dashboard = new Dashboard("test");
dashboard.widgets.map((widget) => {
  console.log({
    id: widget.configuration.id,
    props: widget.props,
  });
});

console.log("Set variable counter1");
dashboard.setVariable("counter1", 4);

console.log("Set variable counter2");
dashboard.setVariable("counter2", 2);
