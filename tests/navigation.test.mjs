import test from 'node:test';
import assert from 'node:assert/strict';
import {steps,creationStepCount,issueStep,restoreNavigation} from '../dist/ui.mjs';
import {soldier} from './fixture.mjs';

test('old saved Experience and Review locations migrate once without changing character choices',()=>{
 for(const [before,after] of [[4,4],[5,6],[6,7]]){
  const original={...soldier(),step:before};
  const migrated=restoreNavigation(original);
  assert.equal(migrated.step,after);
  assert.equal(migrated.navigationVersion,2);
  assert.deepEqual({...migrated,step:before,navigationVersion:undefined},{...original,navigationVersion:undefined});
  assert.deepEqual(restoreNavigation(migrated),migrated);
 }
 assert.equal(restoreNavigation({step:5,navigationVersion:2}).step,5);
});

test('unfinished abilities and belongings route to separate creation steps',()=>{
 assert.equal(steps.length,8);assert.equal(creationStepCount,6);
 for(const issue of ['Roll 4 random Species Talents.','Choose one free first-level Career Talent.','Choose 3 free spells for Petty Magic.'])assert.equal(steps[issueStep(issue)],'Talents',issue);
 for(const issue of ['Roll starting wealth.','Roll the quantity for Parchment {1d10}.','An imported Trapping has no listed book price.','Trapping purchases exceed starting wealth.'])assert.equal(steps[issueStep(issue)],'Gear & money',issue);
 assert.equal(steps[issueStep('Select the bonus level-two Trappings earned by the Career roll.')],'Career');
});
