import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';

import {
  getBusinessObject,
  is
} from 'lib/util/ModelUtil';

import { forEach } from 'min-dash';

var testModules = [
  coreModule,
  modelingModule
];


describe('features/modeling - root element reference behavior', function() {

  var diagramXML = require('./RootElementReferenceBehavior.bpmn');

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('add root element', function() {

    forEach([
      'error',
      'escalation',
      'message',
      'signal'
    ], function(type) {

      describe(type, function() {

        var id = capitalizeFirstChar(type) + 'BoundaryEvent_1';

        var boundaryEvent,
            host,
            rootElement;

        beforeEach(inject(function(copyPaste, elementRegistry, modeling) {

          // given
          boundaryEvent = elementRegistry.get(id);

          host = elementRegistry.get('Task_2');

          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ];

          rootElement = getRootElementReferenced(eventDefinition);

          // when
          copyPaste.copy(boundaryEvent);

          modeling.removeShape(boundaryEvent);

          expect(hasRootElement(rootElement)).to.be.false;

          boundaryEvent = copyPaste.paste({
            element: host,
            point: {
              x: host.x,
              y: host.y
            },
            hints: {
              attach: 'attach'
            }
          })[0];
        }));


        it('<do>', function() {

          // then
          expect(hasRootElement(rootElement)).to.be.true;
        });


        it('<undo>', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(hasRootElement(rootElement)).to.be.false;
        }));


        it('<redo>', inject(function(commandStack) {

          // given
          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expect(hasRootElement(rootElement)).to.be.true;
        }));

      });

    });

  });


  describe('remove root element', function() {

    forEach([
      'error',
      'escalation',
      'message',
      'signal'
    ], function(type) {

      describe(type, function() {

        var id = capitalizeFirstChar(type) + 'BoundaryEvent_1';

        var boundaryEvent,
            rootElement;

        beforeEach(inject(function(elementRegistry, modeling) {

          // given
          boundaryEvent = elementRegistry.get(id);

          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ];

          rootElement = getRootElementReferenced(eventDefinition);

          // when
          modeling.removeShape(boundaryEvent);
        }));


        it('<do>', function() {

          // then
          expect(hasRootElement(rootElement)).to.be.false;
        });


        it('<undo>', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(hasRootElement(rootElement)).to.be.true;
        }));


        it('<redo>', inject(function(commandStack) {

          // given
          commandStack.undo();

          // when
          commandStack.redo();

          // then
          expect(hasRootElement(rootElement)).to.be.false;
        }));

      });

    });

  });


  describe('copy root element reference', function() {

    forEach([
      'error',
      'escalation',
      'message',
      'signal'
    ], function(type) {

      describe(type, function() {

        var id = capitalizeFirstChar(type) + 'BoundaryEvent_1';

        var boundaryEvent,
            host,
            rootElement;

        beforeEach(inject(function(copyPaste, elementRegistry) {

          // given
          boundaryEvent = elementRegistry.get(id);

          host = elementRegistry.get('Task_2');

          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ];

          rootElement = getRootElementReferenced(eventDefinition);

          copyPaste.copy(boundaryEvent);

          // when
          boundaryEvent = copyPaste.paste({
            element: host,
            point: {
              x: host.x,
              y: host.y
            },
            hints: {
              attach: 'attach'
            }
          })[0];
        }));


        it('should copy root element reference', function() {

          // then
          var businessObject = getBusinessObject(boundaryEvent),
              eventDefinitions = businessObject.get('eventDefinitions'),
              eventDefinition = eventDefinitions[ 0 ];

          expect(getRootElementReferenced(eventDefinition)).to.equal(rootElement);
        });

      });

    });

  });

});

// helpers //////////

function getRootElementReferenced(eventDefinition) {
  if (is(eventDefinition, 'bpmn:ErrorEventDefinition')) {
    return eventDefinition.get('errorRef');
  } else if (is(eventDefinition, 'bpmn:EscalationEventDefinition')) {
    return eventDefinition.get('escalationRef');
  } else if (is(eventDefinition, 'bpmn:MessageEventDefinition')) {
    return eventDefinition.get('messageRef');
  } else if (is(eventDefinition, 'bpmn:SignalEventDefinition')) {
    return eventDefinition.get('signalRef');
  }
}

function hasRootElement(rootElement) {
  var definitions = getBpmnJS().getDefinitions(),
      rootElements = definitions.get('rootElements');

  return rootElements.indexOf(rootElement) !== -1;
}

function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}