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
  definition: WidgetDefinition;
  configuration: WidgetConfiguration;
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
        // Check if the variable is initialized with a  function
        if (variableData.defaultFunction) {
          if (variableData.defaultFunction in VariableFunctions) {
            // Set variable executng the function
            this.variables[variableKey] = VariableFunctions[
              variableData.defaultFunction
            ](variableData.defaultValue);

            // Function is not defined
          } else {
            throw Error(
              `Default function "${variableData.defaultFunction}" for variable "${variableKey}" not defined`
            );
          }
        } else {
          // Set variable using the default value
          this.variables[variableKey] = variableData.defaultValue;
        }
      }
    }

    // Initialize widgets
    if (dashboard.widgets) {
      dashboard.widgets.forEach((widgetConfiguration) => {
        // Find widget definition in the database
        const widgetDefinition = db.widgets.find(
          (w) => w.id === widgetConfiguration.widgetId
        );
        if (!widgetDefinition) {
          throw Error(
            `Widget type "${widgetConfiguration.widgetId}" not defined`
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

        // if (widgetConfiguration.id === "nmon-tat-001")
        //   setInterval(() => {
        //     this.setVariablesFromWidget(widgetDefinition, widgetConfiguration, {
        //       days: Math.floor(Math.random() * 100),
        //     });
        //   }, 5000);
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
      // Check binding type
      switch (attributeDefinitionValue.binding) {
        // Settings
        case "setting":
          calculatedAttributes[attributeDefinitionKey] =
            attributeDefinitionValue.value;
          break;
        // Variables configured
        case "in":
        case "in_out":
          const attributeConfiguration =
            widgetConfiguration.attributes[attributeDefinitionKey];

          if (!attributeConfiguration) {
            throw Error(
              `Missing configiration of attribute "${attributeDefinitionKey}" in widget "${widgetConfiguration.id}"`
            );
          }

          // If attribute is assigned with variable
          if (
            (attributeConfiguration as AttributeVariable).variable !== undefined
          ) {
            const variableName = (attributeConfiguration as AttributeVariable)
              .variable;
            calculatedAttributes[attributeDefinitionKey] =
              variables[variableName];
            // If attribute is assigned with a value
          } else {
            calculatedAttributes[attributeDefinitionKey] = (
              attributeConfiguration as AttributeValue
            ).value;
          }
          break;
        // Skip out variables
        case "out":
          break;
        default:
          throw Error(
            `Attribute binding ${attributeDefinitionValue.binding} not valid`
          );
      }
    }
    return calculatedAttributes;
  }

  setVariablesFromWidget(
    widgetDefinition: WidgetDefinition,
    widgetConfiguration: WidgetConfiguration,
    attributes: StringMap<any>
  ) {
    const updatedVariables: StringMap<any> = {};
    for (const [attributeKey, attributeValue] of Object.entries(attributes)) {
      const attributeDefinition = widgetDefinition.attributes[attributeKey];
      const attributeConfiguration =
        widgetConfiguration.attributes[attributeKey];
      if (
        attributeDefinition.binding === "in_out" ||
        attributeDefinition.binding === "out"
      ) {
        // Check if attribute is binded to a variable
        if (
          (attributeConfiguration as AttributeVariable).variable !== undefined
        ) {
          const variableName = (attributeConfiguration as AttributeVariable)
            .variable;

          if (this.variables[variableName] !== attributes[attributeKey]) {
            updatedVariables[variableName] = attributes[attributeKey];
          }
        } else {
          // Send warnign as the variable is out but bot binded
          console.warn(`Attribute "${attributeKey}" not binded to a variable`);
        }
      }
    }
    if (Object.keys(updatedVariables).length > 0) {
      this.setVariables(updatedVariables);
    }
  }

  setVariables(variables: StringMap<any>) {
    this.variables = {
      ...this.variables,
      ...variables,
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
