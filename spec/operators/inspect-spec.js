/* globals describe, it, expect, hot, expectObservable,, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.inspect', function () {
  it('should get inspections when the notifier emits', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|          ');
    var e1subs =         '^                           !          ';
    var e2 =   hot(      '-----x----------x----------x----------|');
    var e2subs =         '^                           !          ';
    var expected =       '-----b----------d----------f|          ';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should inspect nothing if source has not nexted yet', function () {
    var e1 =   hot('----a-^-------b----|');
    var e1subs =         '^            !';
    var e2 =   hot(      '-----x-------|');
    var e2subs =         '^            !';
    var expected =       '-------------|';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete when the notifier completes, nor should it emit', function () {
    var e1 =   hot('----a----b----c----d----e----f----');
    var e1subs =   '^                                 ';
    var e2 =   hot('------x-|                         ');
    var e2subs =   '^       !                         ';
    var expected = '------a---------------------------';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete only when the source completes, if notifier completes early', function () {
    var e1 =   hot('----a----b----c----d----e----f---|');
    var e1subs =   '^                                !';
    var e2 =   hot('------x-|                         ');
    var e2subs =   '^       !                         ';
    var expected = '------a--------------------------|';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|          ');
    var unsub =          '              !                        ';
    var e1subs =         '^             !                        ';
    var e2 =   hot(      '-----x----------x----------x----------|');
    var e2subs =         '^             !                        ';
    var expected =       '-----b---------                        ';

    expectObservable(e1.inspect(e2), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|          ');
    var e1subs =         '^             !                        ';
    var e2 =   hot(      '-----x----------x----------x----------|');
    var e2subs =         '^             !                        ';
    var expected =       '-----b---------                        ';
    var unsub =          '              !                        ';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .inspect(e2)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should inspect multiple times according to the notifier', function () {
    var e1 =   hot('----a----b----c----d----e----f----|  ');
    var e1subs =   '^                                 !  ';
    var e2 =   hot('------x-x------xx-x---x-------------|');
    var e2subs =   '^                                 !  ';
    var expected = '------a-a------cc-c---d-----------|  ';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source raises error', function () {
    var e1 =   hot('----a-^--b----c----d----#                    ');
    var e1subs =         '^                 !                    ';
    var e2 =   hot(      '-----x----------x----------x----------|');
    var e2subs =         '^                 !                    ';
    var expected =       '-----b----------d-#                    ';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should completes if source does not emits', function () {
    var e1 =   hot('|');
    var e2 =   hot('------x-------|');
    var expected = '|';
    var e1subs =   '(^!)';
    var e2subs =   '(^!)';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source throws immediately', function () {
    var e1 =   hot('#');
    var e2 =   hot('------x-------|');
    var expected = '#';
    var e1subs =   '(^!)';
    var e2subs =   '(^!)';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if notification raises error', function () {
    var e1 =   hot('--a-----|');
    var e2 =   hot('----#');
    var expected = '----#';
    var e1subs =   '^   !';
    var e2subs =   '^   !';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not completes if source does not complete', function () {
    var e1 =   hot('-');
    var e1subs =   '^              ';
    var e2 =   hot('------x-------|');
    var e2subs =   '^             !';
    var expected = '-';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should inspect only until source completes', function () {
    var e1 =   hot('----a----b----c----d-|');
    var e1subs =   '^                    !';
    var e2 =   hot('-----------x----------x------------|');
    var e2subs =   '^                    !';
    var expected = '-----------b---------|';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete sampling if inspect observable completes', function () {
    var e1 =   hot('----a----b----c----d-|');
    var e1subs =   '^                    !';
    var e2 =   hot('|');
    var e2subs =   '(^!)';
    var expected = '---------------------|';

    expectObservable(e1.inspect(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});