/**
 * POST /api/query
 * Main query processing pipeline:
 *   1. Classify intent (Naive Bayes)
 *   2. Extract entities (rule-based NER)
 *   3. Run cross-data correlator
 *   4. Score suspicion
 *   5. Return structured response
 */

import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { classifyIntent } from '../../../lib/nlp/intent-classifier';
import { extractEntities } from '../../../lib/nlp/entity-extractor';
import {
  findCalls,
  findChats,
  keywordSearch,
  buildTimeline,
  buildNetworkGraph,
  findContacts,
} from '../../../lib/forensics/correlator';
import { scoreEntity, scoreAllEntities } from '../../../lib/forensics/suspicion-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, caseId, userId, caseData: directCaseData } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // --- Layer 1: NLP Intent Detection ---
    const intentResult = classifyIntent(query);
    const entities = extractEntities(query);

    // --- Use provided case data or fetch from vault ---
    let caseData = directCaseData;
    
    if (!caseData && caseId && userId) {
      const caseDoc = await getDoc(doc(db, `users/${userId}/cases`, caseId));
      if (caseDoc.exists()) {
        caseData = caseDoc.data();
      }
    }

    if (!caseData) {
      return NextResponse.json({ error: 'Investigation case context missing.' }, { status: 404 });
    }

    // --- Layer 2: Cross-Data Correlation ---
    let results = [];
    let resultType = intentResult.intent;
    let summary = '';

    switch (intentResult.intent) {
      case 'find_calls': {
        results = findCalls(caseData, entities);
        summary = `Found ${results.length} call(s)${entities.timeFilter ? ` during ${entities.timeFilter.label}` : ''}${entities.person ? ` involving ${entities.person}` : ''}.`;
        break;
      }
      case 'find_chats': {
        results = findChats(caseData, entities);
        summary = `Found ${results.length} message(s)${entities.platform ? ` on ${entities.platform}` : ''}${entities.person ? ` with ${entities.person}` : ''}.`;
        break;
      }
      case 'keyword_search': {
        const keyword = entities.keyword || query;
        results = keywordSearch(caseData, keyword);
        summary = `Found ${results.length} message(s) matching "${keyword}".`;
        resultType = 'keyword_search';
        break;
      }
      case 'build_timeline': {
        results = findChats(caseData, entities); // Using simple findChats for timeline in this demo
        summary = `Built timeline from forensic artifacts.`;
        break;
      }
      case 'get_suspicion': {
        const targetPhone = entities.phoneNumber || caseData.metadata.suspectPhone;
        const score = scoreEntity(targetPhone, caseData);
        results = [{ ...score, phone: targetPhone }];
        summary = `Suspicion score: ${score.score}/100 — Risk Level: ${score.riskLevel}`;
        break;
      }
      case 'find_contacts': {
        results = findContacts(caseData, entities);
        summary = `Found ${results.length} contact(s)${entities.person ? ` matching "${entities.person}"` : ''}.`;
        break;
      }
      default: {
        results = keywordSearch(caseData, query);
        summary = `Searched across all data. Found ${results.length} result(s).`;
      }
    }

    // --- Layer 3: Suspicion Scoring ---
    const suspicionData = scoreAllEntities(caseData);

    // Network graph data
    const networkGraph = buildNetworkGraph(caseData);

    return NextResponse.json({
      success: true,
      query,
      intent: intentResult,
      entities,
      results,
      resultType,
      summary,
      suspicion: suspicionData,
      networkGraph,
      metadata: {
        dataSources: 4,
        totalResults: results.length,
        processingTime: Date.now(),
      }
    });

  } catch (error) {
    console.error('Query processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
