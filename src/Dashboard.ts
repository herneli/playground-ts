import { db } from "./db";
import {
  AttributeValue,
  AttributeVariable,
  StringMap,
  WidgetConfiguration,
  WidgetDefinition,
} from "./models/dashboard.model";
import { WidgetProps } from "./models/widget-props.model";
import { getChangedProperties } from "./utils/getChangedProps";

type Variables = StringMap<any>;

type Widget = {
  configuration: WidgetConfiguration;
  definition: WidgetDefinition;
  props: WidgetProps;
};

export class Dashboard {
  variables: Variables = {};
  widgets: Widget[] = [];
  constructor(dashboardId: string) {
    const dashboard = db.dashboards.find((d) => d.id === dashboardId);
    if (!dashboard) {
      throw Error(`Dashbord "${dashboardId}" not found`);
    }

    // Initialize variables
    if (dashboard.variables) {
      for (const [variableKey, variableData] of Object.entries(
        dashboard.variables
      )) {
        this.variables[variableKey] = variableData.defaultValue;
      }
    }

    // Initialize widgets
    if (dashboard.widgets) {
      dashboard.widgets.forEach((widgetConfiguration) => {
        const widgetDefinition = db.widgets.find(
          (w) => w.id === widgetConfiguration.widgetTypeId
        );
        if (!widgetDefinition) {
          throw Error(
            `Widget type "${widgetConfiguration.widgetTypeId}" not defined`
          );
        }

        // Calculate widget props
        const attributes = this.calculateWidgetAttributes(
          widgetDefinition,
          widgetConfiguration,
          this.variables
        );

        // Add widget
        this.widgets.push({
          definition: widgetDefinition,
          configuration: widgetConfiguration,
          props: {
            id: widgetConfiguration.id,
            workspaceConfig: widgetConfiguration.workspaceConfig,
            attributes: attributes,
          },
        });
      });
    }
  }

  calculateWidgetAttributes(
    widgetDefinition: WidgetDefinition,
    widgetConfiguration: WidgetConfiguration,
    variables: Variables,
    previousAttributes?: StringMap<any>
  ): StringMap<any> {
    const calculatedAttributes: StringMap<any> =
      { ...previousAttributes } || {};

    // Iterate attribute definitions
    for (const [
      attributeDefinitionKey,
      attributeDefinitionValue,
    ] of Object.entries(widgetDefinition.attributes)) {
      switch (attributeDefinitionValue.binding) {
        case "setting":
          calculatedAttributes[attributeDefinitionKey] =
            attributeDefinitionValue.value;
          break;
        case "in":
        case "in_out":
          const attributeConfiguration =
            widgetConfiguration.attributes[attributeDefinitionKey];
          if (
            (attributeConfiguration as AttributeVariable).variable !== undefined
          ) {
            const variableName = (attributeConfiguration as AttributeVariable)
              .variable;
            calculatedAttributes[attributeDefinitionKey] =
              variables[variableName];
          } else {
            calculatedAttributes[attributeDefinitionKey] = (
              attributeConfiguration as AttributeValue
            ).value;
          }
          break;
        default:
          throw Error(
            `Attribute bining ${attributeDefinitionValue.binding} not valid`
          );
      }
    }
    return calculatedAttributes;
  }

  setVariable(key: string, value: any) {
    this.variables = {
      ...this.variables,
      [key]: value,
    };

    // Refresh widgets
    for (const widget of this.widgets) {
      const attributes = this.calculateWidgetAttributes(
        widget.definition,
        widget.configuration,
        this.variables,
        widget.props.attributes
      );

      const props = getChangedProperties(attributes, widget.props.attributes);
      if (props.length > 0) {
        console.log(`Changed props in widget ${widget.configuration.id}`);
        for (const prop of props) {
          console.log(
            `Prop ${prop}: ${widget.props.attributes[prop]} -> ${attributes[prop]}`
          );
        }
      }
      widget.props.attributes = attributes;
    }
  }
}
