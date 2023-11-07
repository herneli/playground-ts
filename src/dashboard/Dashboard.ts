import { db } from "../mock/db";
import { StringMap } from "../models/common.model";
import {
  AttributeValue,
  AttributeVariable,
  WidgetConfiguration,
  WidgetDefinition,
} from "../models/dashboard.model";
import { WidgetProps } from "../models/widget-props.model";
import { getChangedProperties } from "../utils/getChangedProps";
import { VariableFunctions } from "../utils/variableFunctions";

type Variables = StringMap<any>;

type Widget = {
  configuration: WidgetConfiguration;
  definition: WidgetDefinition;
  props: WidgetProps;
};

export class Dashboard {
  // Dashboard properties
  variables: Variables = {};
  widgets: Widget[] = [];

  // Constructor
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
        // The variable is initialized with a function
        if (variableData.defaultFunction) {
          // If funtion is defined
          if (variableData.defaultFunction in VariableFunctions) {
            this.variables[variableKey] = VariableFunctions[
              variableData.defaultFunction
            ](variableData.defaultValue);

            // Function is not defined
          } else {
            throw Error(
              `Default function "${variableData.defaultFunction}" for variable "${variableKey}" not defined`
            );
          }
          // The variable is initialized with a value
        } else {
          this.variables[variableKey] = variableData.defaultValue;
        }
      }
    }

    // Initialize widgets
    if (dashboard.widgets) {
      dashboard.widgets.forEach((widgetConfiguration) => {
        // Find widget definition in the database
        const widgetDefinition = db.widgets.find(
          (w) => w.id === widgetConfiguration.widgetTypeId
        );
        if (!widgetDefinition) {
          throw Error(
            `Widget type "${widgetConfiguration.widgetTypeId}" not defined`
          );
        }

        // Calculate widget props based on initial variables
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

  // Calculate attrinutes of widget based on current variables
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
          if (!attributeConfiguration) {
            throw Error(
              `Missing configiration of attribute "${attributeDefinitionKey}" in widget "${widgetConfiguration.id}"`
            );
          }
          console.log(attributeDefinitionValue);
          console.log(attributeConfiguration);
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
    this.updateWidgetAttributes();
  }

  // Modify widget properties with new values
  private updateWidgetAttributes() {
    for (const widget of this.widgets) {
      const attributes = this.calculateWidgetAttributes(
        widget.definition,
        widget.configuration,
        this.variables,
        widget.props.attributes
      );

      // Check which variables have changed and log the differences
      const props = getChangedProperties(attributes, widget.props.attributes);
      if (props.length > 0) {
        console.log("------------------------------------");
        console.log(`Changed props in widget ${widget.configuration.id}`);
        for (const prop of props) {
          console.log(
            `"${prop}": ${widget.props.attributes[prop]} -> ${attributes[prop]}`
          );
        }
        console.log("------------------------------------");
      }
      // Set new attributes
      widget.props.attributes = attributes;
    }
  }
}
