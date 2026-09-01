/**
 * @file entityRelations.test.js
 * @description Comprehensive unit test suite for Entity Relations Graph & Relational Decoupling (M1)
 * @module test/unit/entityRelations
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const DatabaseManager = require('../../src/db/DatabaseManager');

describe('Milestone 1: Entity Relations Graph Test Suite', () => {
  let dbManager = null;
  let terraId = null;
  let solId = null;
  let marsId = null;
  let fleetId = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');

    // Seed 4 entities
    const e1 = dbManager.entities.insert({ entity_id: 'PL-001', canonical_name: '泰拉', entity_type: 'planet' });
    const e2 = dbManager.entities.insert({ entity_id: 'SYS-SOL', canonical_name: '太阳系', entity_type: 'location' });
    const e3 = dbManager.entities.insert({ entity_id: 'PL-002', canonical_name: '火星', entity_type: 'planet' });
    const e4 = dbManager.entities.insert({ entity_id: 'ORG-001', canonical_name: '太阳系远征舰队', entity_type: 'organization' });

    terraId = e1.id;
    solId = e2.id;
    marsId = e3.id;
    fleetId = e4.id;
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  it('should insert and retrieve an entity relation record', () => {
    const rel = dbManager.entityRelations.createRelation({
      source_entity_id: terraId,
      target_entity_id: solId,
      relation_type: 'located_in',
      description: '泰拉位于太阳系第三行星轨道',
      weight: 1.0,
      bidirectional: 0
    });

    assert.ok(rel.id > 0);
    assert.equal(rel.source_entity_id, terraId);
    assert.equal(rel.target_entity_id, solId);
    assert.equal(rel.relation_type, 'located_in');
    assert.equal(rel.description, '泰拉位于太阳系第三行星轨道');

    const fetched = dbManager.entityRelations.getById(rel.id);
    assert.equal(fetched.id, rel.id);
    assert.equal(fetched.source_entity_id, terraId);
    assert.equal(fetched.target_entity_id, solId);
  });

  it('should enforce unique constraint on (source_entity_id, target_entity_id, relation_type)', () => {
    dbManager.entityRelations.createRelation({
      source_entity_id: terraId,
      target_entity_id: solId,
      relation_type: 'located_in'
    });

    assert.throws(
      () => {
        dbManager.entityRelations.createRelation({
          source_entity_id: terraId,
          target_entity_id: solId,
          relation_type: 'located_in'
        });
      },
      /UNIQUE constraint failed/
    );
  });

  it('should query outgoing and incoming relations for a given entity', () => {
    dbManager.entityRelations.createRelation({ source_entity_id: terraId, target_entity_id: solId, relation_type: 'located_in' });
    dbManager.entityRelations.createRelation({ source_entity_id: marsId, target_entity_id: solId, relation_type: 'located_in' });
    dbManager.entityRelations.createRelation({ source_entity_id: fleetId, target_entity_id: terraId, relation_type: 'allied_with', bidirectional: 1 });

    const terraRelations = dbManager.entityRelations.getRelationsForEntity(terraId);
    assert.equal(terraRelations.length, 2, 'Terra has 1 outgoing (located_in Sol) and 1 incoming (fleet allied_with)');

    const solIncoming = dbManager.entityRelations.getIncomingRelations(solId);
    assert.equal(solIncoming.length, 2, 'Sol has 2 incoming located_in relations');
  });

  it('should filter relations by relation_type', () => {
    dbManager.entityRelations.createRelation({ source_entity_id: terraId, target_entity_id: marsId, relation_type: 'allied_with' });
    dbManager.entityRelations.createRelation({ source_entity_id: terraId, target_entity_id: solId, relation_type: 'located_in' });

    const allies = dbManager.entityRelations.getRelationsByType('allied_with');
    assert.equal(allies.length, 1);
    assert.equal(allies[0].source_entity_id, terraId);
    assert.equal(allies[0].target_entity_id, marsId);
  });

  it('should traverse multi-hop neighborhood graph without infinite cycles', () => {
    // Cyclic graph: Terra <-> Mars, Mars -> Sol
    dbManager.entityRelations.createRelation({ source_entity_id: terraId, target_entity_id: marsId, relation_type: 'allied_with', bidirectional: 1 });
    dbManager.entityRelations.createRelation({ source_entity_id: marsId, target_entity_id: solId, relation_type: 'located_in' });

    const graph = dbManager.entityRelations.getGraph([terraId], 2);
    assert.ok(graph.nodes);
    assert.ok(graph.edges);

    const nodeIds = graph.nodes.map((n) => n.id);
    assert.ok(nodeIds.includes(terraId));
    assert.ok(nodeIds.includes(marsId));
    assert.ok(nodeIds.includes(solId));
    assert.equal(graph.edges.length, 2);
  });

  it('should find shortest paths between two entities in knowledge graph', () => {
    // Terra -> Mars -> Sol
    dbManager.entityRelations.createRelation({ source_entity_id: terraId, target_entity_id: marsId, relation_type: 'trade_with' });
    dbManager.entityRelations.createRelation({ source_entity_id: marsId, target_entity_id: solId, relation_type: 'located_in' });

    const paths = dbManager.entityRelations.findPaths(terraId, solId, 3);
    assert.ok(Array.isArray(paths));
    assert.ok(paths.length >= 1);
    const pathNodes = paths[0].map((step) => step.nodeId);
    assert.deepEqual(pathNodes, [terraId, marsId, solId]);
  });

  it('should cascade delete relations when an entity is deleted', () => {
    dbManager.entityRelations.createRelation({ source_entity_id: terraId, target_entity_id: solId, relation_type: 'located_in' });
    assert.equal(dbManager.entityRelations.count(), 1);

    dbManager.entities.deleteById(terraId);
    assert.equal(dbManager.entityRelations.count(), 0, 'Relation must be cascade deleted when Terra is removed');
  });

  it('should support upsert and batchUpsert for relations', () => {
    const upserted = dbManager.entityRelations.upsert({
      source_entity_id: terraId,
      target_entity_id: solId,
      relation_type: 'orbiting',
      weight: 0.8,
      description: 'Initial orbit'
    });
    assert.ok(upserted);
    assert.equal(upserted.weight, 0.8);

    // Update via upsert
    const updated = dbManager.entityRelations.upsert({
      source_entity_id: terraId,
      target_entity_id: solId,
      relation_type: 'orbiting',
      weight: 1.2,
      description: 'Updated orbit'
    });
    assert.equal(updated.weight, 1.2);
    assert.equal(dbManager.entityRelations.count(), 1);

    // Batch upsert
    const batchCount = dbManager.entityRelations.batchUpsert([
      { source_entity_id: marsId, target_entity_id: solId, relation_type: 'orbiting', weight: 1.0 },
      { source_entity_id: fleetId, target_entity_id: marsId, relation_type: 'patrolling', weight: 0.9 }
    ]);
    assert.equal(batchCount, 2);
    assert.equal(dbManager.entityRelations.count(), 3);
  });
});
