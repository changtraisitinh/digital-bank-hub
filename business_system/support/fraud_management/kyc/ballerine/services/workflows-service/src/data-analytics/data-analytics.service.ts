import { MERCHANT_REPORT_TYPES_MAP, MerchantReportType } from '@ballerine/common';
import { AppLoggerService } from '@/common/app-logger/app-logger.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AlertSeverity, Prisma } from '@prisma/client';
import { isEmpty } from 'lodash';
import { AggregateType } from './consts';
import {
  CheckRiskScoreOptions,
  DailySingleTransactionAmountType,
  HighTransactionTypePercentage,
  HighVelocityHistoricAverageOptions,
  InlineRule,
  TCustomersTransactionTypeOptions,
  TDormantAccountOptions,
  TExcludedCounterparty,
  TMerchantGroupAverage,
  TMultipleMerchantsOneCounterparty,
  TPeerGroupTransactionAverageOptions,
  TransactionsAgainstDynamicRulesType,
} from './types';
import { calculateStartDate } from './utils';

const COUNTERPARTY_ORIGINATOR_JOIN_CLAUSE = Prisma.sql`JOIN "Counterparty" AS "cpOriginator" ON "tr"."counterpartyOriginatorId" = "cpOriginator"."id"`;
const COUNTERPARTY_BENEFICIARY_JOIN_CLAUSE = Prisma.sql`JOIN "Counterparty" AS "cpBeneficiary" ON "tr"."counterpartyBeneficiaryId" = "cpBeneficiary"."id"`;

@Injectable()
export class DataAnalyticsService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly logger: AppLoggerService,
  ) {}

  async runInlineRule(projectId: string, inlineRule: InlineRule) {
    switch (inlineRule.fnName) {
      case 'evaluateHighTransactionTypePercentage':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateTransactionsAgainstDynamicRules':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateCustomersTransactionType':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateTransactionAvg':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateDormantAccount':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateHighVelocityHistoricAverage':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateMultipleMerchantsOneCounterparty':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateMerchantGroupAverage':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });

      case 'evaluateDailySingleTransactionAmount':
        return await this[inlineRule.fnName]({
          ...inlineRule.options,
          projectId,
        });
    }

    this.logger.error(`No evaluation function found`, {
      inlineRule,
    });

    throw new Error(`No evaluation function found for rule name: ${(inlineRule as InlineRule).id}`);
  }

  private _buildExcludedCounterpartyClause(
    excludedCounterparty: TExcludedCounterparty = {
      counterpartyBeneficiaryIds: [],
      counterpartyOriginatorIds: [],
    },
  ) {
    const excludedCounterpartyClause: {
      conditions: Prisma.Sql[];
      join: Prisma.Sql[];
    } = {
      conditions: [],
      join: [],
    };

    if (excludedCounterparty) {
      if (excludedCounterparty.counterpartyBeneficiaryIds.length) {
        excludedCounterpartyClause.join.push(COUNTERPARTY_BENEFICIARY_JOIN_CLAUSE);

        (excludedCounterparty.counterpartyBeneficiaryIds || []).forEach(id =>
          excludedCounterpartyClause.conditions.push(
            Prisma.sql`"cpBeneficiary"."correlationId" NOT LIKE ${id}`,
          ),
        );
      }

      if (excludedCounterparty.counterpartyOriginatorIds.length) {
        excludedCounterpartyClause.join.push(COUNTERPARTY_ORIGINATOR_JOIN_CLAUSE);

        (excludedCounterparty.counterpartyOriginatorIds || []).forEach(id =>
          excludedCounterpartyClause.conditions.push(
            Prisma.sql`"cpOriginator"."correlationId" NOT LIKE ${id}`,
          ),
        );
      }
    }

    const excludedCounterpartyWhereClause = excludedCounterpartyClause.conditions.length
      ? Prisma.join(excludedCounterpartyClause.conditions, ' OR ', '(', ')')
      : Prisma.empty;

    const excludedCounterpartyJoinClause = excludedCounterpartyClause.conditions.length
      ? Prisma.join(excludedCounterpartyClause.join, '\n ')
      : Prisma.empty;

    return {
      excludedCounterpartyClause,
      excludedCounterpartyWhereClause,
      excludedCounterpartyJoinClause,
    };
  }

  async checkMerchantOngoingAlert(
    {
      projectId,
      businessId,
      currentRiskScore,
      previousRiskScore,
      previousReportType,
    }: {
      projectId: string;
      businessId: string;
      currentRiskScore: number;
      previousRiskScore: number;
      previousReportType: MerchantReportType;
    },
    {
      increaseRiskScorePercentage,
      increaseRiskScore,
      maxRiskScoreThreshold,
    }: CheckRiskScoreOptions,
    alertSeverity: AlertSeverity,
  ) {
    if (previousReportType !== MERCHANT_REPORT_TYPES_MAP.ONGOING_MERCHANT_REPORT_T1) {
      this.logger.warn(`Previous report type is not ONGOING_MERCHANT_REPORT_T1`);

      return;
    }

    if (currentRiskScore < previousRiskScore) {
      return;
    }

    if (!(maxRiskScoreThreshold || increaseRiskScore || increaseRiskScorePercentage)) {
      this.logger.warn(`Rule for ${businessId} ${projectId} missing required options`, {
        maxRiskScoreThreshold,
        increaseRiskScore,
        increaseRiskScorePercentage,
      });

      return;
    }

    let ruleResult:
      | {
          severity: AlertSeverity;
          alertReason: string;
        }
      | undefined;

    if (maxRiskScoreThreshold && currentRiskScore >= maxRiskScoreThreshold) {
      ruleResult = {
        severity: alertSeverity,
        alertReason: `The risk score has exceeded the threshold of ${maxRiskScoreThreshold}`,
      };
    }

    if (increaseRiskScore && currentRiskScore - previousRiskScore >= increaseRiskScore) {
      ruleResult = {
        severity: alertSeverity,
        alertReason: `The risk score has been increased by more than ${increaseRiskScore} from previous monitoring`,
      };
    }

    if (
      increaseRiskScorePercentage &&
      ((currentRiskScore - previousRiskScore) / previousRiskScore) * 100 >=
        increaseRiskScorePercentage
    ) {
      ruleResult = {
        severity: alertSeverity,
        alertReason: `The risk score has been significantly increased from previous monitoring`,
      };
    }

    if (!ruleResult) {
      return;
    }

    const executionDetails = {
      businessId: businessId,
      projectId: projectId,
      riskScore: currentRiskScore,
      previousRiskScore,
      ...ruleResult,
    };

    return executionDetails;
  }

  async evaluateTransactionsAgainstDynamicRules({
    projectId,
    amountThreshold,
    amountBetween,
    direction,
    transactionType = [],
    excludedCounterparty = {
      counterpartyBeneficiaryIds: [],
      counterpartyOriginatorIds: [],
    },
    paymentMethods = [],
    excludePaymentMethods = false,
    timeAmount,
    timeUnit,
    groupBy = [],
    havingAggregate = AggregateType.SUM,
  }: TransactionsAgainstDynamicRulesType) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    if (!Array.isArray(groupBy) || groupBy.length === 0) {
      throw new Error('groupBy is required');
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"projectId" = ${projectId}`,
      Prisma.sql`"transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
        `${timeAmount} ${timeUnit}`,
      )}'`,
      Prisma.sql`"transactionDate" <= NOW()`,
    ];

    if (!isEmpty(transactionType)) {
      conditions.push(
        Prisma.sql`"tr"."transactionType"::text IN (${Prisma.join([...transactionType], ',')})`,
      );
    }

    if (direction) {
      conditions.push(Prisma.sql`"transactionDirection"::text = ${direction}`);
    }

    if (excludedCounterparty) {
      (excludedCounterparty.counterpartyBeneficiaryIds || []).forEach(id =>
        // @TODO: Check against correlationId
        conditions.push(Prisma.sql`"counterpartyBeneficiaryId" NOT LIKE ${id}`),
      );

      (excludedCounterparty.counterpartyOriginatorIds || []).forEach(id =>
        // @TODO: Check against correlationId
        conditions.push(Prisma.sql`"counterpartyOriginatorId" NOT LIKE ${id}`),
      );
    }

    if (!isEmpty(paymentMethods)) {
      const methodCondition = excludePaymentMethods ? `NOT IN` : `IN`;

      conditions.push(
        Prisma.sql`"paymentMethod"::text ${Prisma.raw(methodCondition)} (${Prisma.join([
          ...paymentMethods,
        ])})`,
      );
    }

    if (amountBetween) {
      conditions.push(
        Prisma.sql`"transactionBaseAmount" BETWEEN ${amountBetween.min} AND ${amountBetween.max}`,
      );
    }

    // build conditional select, businessId alone, counterpartyOriginatorId alone, or both
    let selectClause: Prisma.Sql = Prisma.empty;
    let groupByClause: Prisma.Sql = Prisma.empty;

    if (groupBy) {
      try {
        selectClause = Prisma.join([
          ...groupBy
            .slice(0)
            .map(groupByField => [
              Prisma.sql`"${Prisma.raw(groupByField)}" as "counterpartyId"`,
              Prisma.sql`"${Prisma.raw(groupByField)}"`,
            ])
            .flat(),
          ...groupBy
            .slice(1, groupBy.length - 1)
            .map(groupByField => Prisma.sql`"${Prisma.raw(groupByField)}"`),
        ]);
      } catch (error) {
        this.logger.log('Error building clause', { error });
      }
      conditions.push(
        ...groupBy.map(groupByField => Prisma.sql`"${Prisma.raw(groupByField)}" IS NOT NULL`),
      );
      groupByClause = Prisma.join(
        groupBy.map(groupByField => Prisma.sql`"${Prisma.raw(groupByField)}"`),
        ',',
      );
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    let havingClause = '';
    let query: Prisma.Sql;

    switch (havingAggregate) {
      case AggregateType.COUNT:
        havingClause = `${AggregateType.COUNT}(id)`;
        query = Prisma.sql`SELECT ${selectClause}, COUNT(id) AS "transactionCount" FROM "TransactionRecord" "tr" WHERE ${whereClause} GROUP BY ${groupByClause} HAVING ${Prisma.raw(
          havingClause,
        )} > ${amountThreshold}`;
        break;
      case AggregateType.SUM:
        havingClause = `${AggregateType.SUM}("tr"."transactionBaseAmount")`;
        query = Prisma.sql`SELECT ${selectClause}, SUM("tr"."transactionBaseAmount") AS "totalAmount", COUNT(id) AS "transactionCount" FROM "TransactionRecord" "tr" WHERE ${whereClause} GROUP BY ${groupByClause} HAVING ${Prisma.raw(
          havingClause,
        )} > ${amountThreshold}`;
        break;
      default:
        query = Prisma.sql`SELECT ${selectClause}, COUNT(id) AS "transactionCount" FROM "TransactionRecord" "tr" WHERE ${whereClause} GROUP BY ${groupByClause}`;
    }

    return await this._executeQuery<Array<Record<string, unknown>>>(query);
  }

  async evaluateHighTransactionTypePercentage({
    projectId,
    transactionType,
    subjectColumn,
    minimumCount,
    minimumPercentage,
    timeAmount,
    timeUnit,
  }: HighTransactionTypePercentage) {
    // TODO: Optimize this query with HAVING c
    return await this._executeQuery<Array<{ counterpartyId: string }>>(Prisma.sql`
      WITH "transactionsData" AS (
        SELECT
          "${Prisma.raw(subjectColumn)}",
          COUNT(*) AS "transactionCount",
          COUNT(*) FILTER (WHERE "transactionType"::text = ${Prisma.sql`${transactionType}`}) AS "filteredTransactionCount"
        FROM
          "TransactionRecord"
        WHERE
          "projectId" = ${projectId}
          AND "transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
            `${timeAmount} ${timeUnit}`,
          )}'
          AND "transactionDate" <= NOW()
        GROUP BY
          "${Prisma.raw(subjectColumn)}"
      )
      SELECT
        "${Prisma.raw(subjectColumn)}"
      FROM
        "transactionsData"
      WHERE
        "filteredTransactionCount" >= ${minimumCount}
        AND "filteredTransactionCount"::decimal / "transactionCount"::decimal * 100 >= ${minimumPercentage}
    `);
  }

  async evaluatePaymentUnexpected({
    projectId,
    factor = 2,
    customerExpectedAmount = 0,
  }: {
    projectId: string;
    factor?: number;
    customerExpectedAmount?: number;
  }) {
    // TODO: get the customer expected amount from the customer's config
    const conditions: Prisma.Sql[] = [
      Prisma.sql`"tr"."projectId" = ${projectId}`,
      Prisma.sql`jsonb_exists(config, 'customer_expected_amount') AND ((config ->> 'customer_expected_amount')::numeric * ${factor}) != ${customerExpectedAmount}`,
      Prisma.sql`"tr"."transactionBaseAmount" > (config ->> 'customer_expected_amount')::numeric`,
    ];

    const query: Prisma.Sql = Prisma.sql`SELECT "tr"."businessId" , "tr"."transactionBaseAmount" FROM "TransactionRecord" as "tr"
    WHERE ${Prisma.join(conditions, ' AND ')} `;

    const results = await this.prisma.$queryRaw(query);

    return results;
  }

  async evaluateDormantAccount({ projectId, timeAmount, timeUnit }: TDormantAccountOptions) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const query: Prisma.Sql = Prisma.sql`
  WITH transactions AS (
    SELECT
      "tr"."counterpartyBeneficiaryId" as "counterpartyBeneficiaryId",
      count(
        CASE WHEN "tr"."transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
          `${timeAmount} ${timeUnit}`,
        )}' THEN
          "tr"."id"
        END) AS "totalTransactionWithinSixMonths",
      count("tr"."id") AS "totalTransactionAllTime"
    FROM
      "TransactionRecord" AS "tr"
    WHERE
      "tr"."projectId" = ${projectId}
      AND  "tr"."counterpartyBeneficiaryId" IS NOT NULL
      AND  "tr"."transactionDate" <= NOW()
    GROUP BY
      "tr"."counterpartyBeneficiaryId"
  )
  SELECT
    *
  FROM
    transactions
  WHERE
    "totalTransactionAllTime" > 1
    AND "totalTransactionWithinSixMonths" = 1;
  `;

    return await this._executeQuery<Array<Record<string, unknown>>>(query);
  }

  async evaluateCustomersTransactionType({
    projectId,
    transactionType = [],
    threshold = 5_000,
    paymentMethods = [],
    timeAmount,
    timeUnit,
    isPerBrand = false,
    havingAggregate = AggregateType.SUM,
  }: TCustomersTransactionTypeOptions) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    if (!Array.isArray(transactionType) || !transactionType.length) {
      throw new Error('transactionType is required');
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"tr"."projectId" = '${projectId}'`,
      Prisma.sql`"tr"."businessId" IS NOT NULL`,
      // TODO: should we use equation instead of IN clause?
      Prisma.sql`"tr"."transactionType"::text IN (${Prisma.join(transactionType, ',')})`,
      Prisma.sql`"tr"."transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
        `${timeAmount} ${timeUnit}`,
      )}'`,
      Prisma.sql`"tr"."transactionDate" <= NOW()`,
    ];

    if (!isEmpty(paymentMethods)) {
      conditions.push(Prisma.sql`"paymentMethod" IN (${Prisma.join([...paymentMethods])})`);
    }

    // High Velocity - Refund
    const groupBy = {
      clause: Prisma.join(
        [
          Prisma.raw(`"tr"."businessId"`),
          isPerBrand ? Prisma.raw(`paymentBrandName`) : Prisma.empty,
        ],
        ',',
      ),
    };

    let havingClause = '';

    switch (havingAggregate) {
      case AggregateType.COUNT:
        havingClause = `${AggregateType.COUNT}("id")`;
        break;
      case AggregateType.SUM:
        havingClause = `${AggregateType.SUM}("tr"."transactionBaseAmount")`;
        break;
      default:
        throw new Error(`Invalid aggregate type: ${havingAggregate}`);
    }

    const query = Prisma.sql`
      SELECT ${groupBy.clause},
      FROM "TransactionRecord" as "tr"
      WHERE ${Prisma.join(conditions, ' AND ')}
      GROUP BY ${groupBy.clause}  HAVING ${Prisma.raw(havingClause)} > ${threshold}`;

    return await this._executeQuery<Array<Record<string, unknown>>>(query);
  }

  async evaluateTransactionAvg({
    projectId,
    transactionDirection,
    paymentMethod,
    minimumCount,
    minimumTransactionAmount,
    transactionFactor,
    customerType,
    timeUnit,
    timeAmount,
  }: TPeerGroupTransactionAverageOptions) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"tr"."projectId" = ${projectId}`,
      Prisma.sql`"transactionDirection"::text = ${transactionDirection}`,
      Prisma.sql`"tr"."paymentMethod"::text ${Prisma.raw(paymentMethod.operator)} ${
        paymentMethod.value
      }`,
      Prisma.sql`"transactionDate" <= NOW()`,
      !!timeAmount &&
        !!timeUnit &&
        Prisma.sql`"tr"."transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
          `${timeAmount} ${timeUnit}`,
        )}'`,
      !!customerType && Prisma.sql`b."businessType" = ${customerType}`,
    ].filter(Boolean);

    return await this._executeQuery<Array<{ counterpartyId: string }>>(
      Prisma.sql`
    WITH "transactionsData" AS (
      SELECT
        "counterpartyBeneficiaryId",
        COUNT(*) AS count,
        avg("transactionBaseAmount") AS avg
      FROM
        "TransactionRecord" "tr" ${
          customerType
            ? Prisma.sql`JOIN "Counterparty" AS "cp" ON "tr"."counterpartyBeneficiaryId" = "cp".id
               JOIN "Business" AS b ON "cp"."businessId" = b.id`
            : Prisma.empty
        }
      WHERE
        ${Prisma.join(conditions, ' AND ')}
      GROUP BY
        "counterpartyBeneficiaryId"
      HAVING COUNT(*) > ${minimumCount}
    )
    SELECT
      "tr"."counterpartyBeneficiaryId" as "counterpartyBeneficiaryId"
    FROM
      "TransactionRecord" tr
      JOIN "transactionsData" td ON "tr"."counterpartyBeneficiaryId" = td."counterpartyBeneficiaryId"
    WHERE
      "transactionBaseAmount" > ${minimumTransactionAmount}
      AND "transactionBaseAmount" > (
        ${transactionFactor} * avg
      )
    GROUP BY
      "tr"."counterpartyBeneficiaryId";
      `,
    );
  }

  async evaluateHighVelocityHistoricAverage({
    projectId,
    transactionDirection,
    paymentMethod,
    minimumCount,
    transactionFactor,
    activeUserPeriod,
    lastDaysPeriod,
    timeUnit,
  }: HighVelocityHistoricAverageOptions) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const historicalTransactionClause = Prisma.sql`CURRENT_DATE - INTERVAL '${Prisma.raw(
      `${activeUserPeriod.timeAmount} ${timeUnit}`,
    )}'`;

    const recentDaysClause = Prisma.sql`CURRENT_DATE - INTERVAL '${Prisma.raw(
      `${lastDaysPeriod.timeAmount} ${timeUnit}`,
    )}'`;

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"projectId" = ${projectId}`,
      Prisma.sql`"counterpartyBeneficiaryId" IS NOT NULL`,
      Prisma.sql`"transactionDirection"::text = ${transactionDirection}`,
      Prisma.sql`"paymentMethod"::text ${Prisma.raw(paymentMethod.operator)} ${
        paymentMethod.value
      }`,
    ];

    // Prisma.sql`"transactionDate" <= NOW()`,

    return await this._executeQuery<Array<{ counterpartyId: string }>>(
      Prisma.sql`WITH allTransactions AS (
	SELECT
		"counterpartyBeneficiaryId",
		count(*) AS allTransactionsCount,
		count(id) FILTER (WHERE "transactionDate" BETWEEN ${historicalTransactionClause} AND ${recentDaysClause}) AS lastTransactionsCount,
		count(id) FILTER (WHERE "transactionDate" > ${recentDaysClause}) AS activeDaysTransactions
	FROM
		"TransactionRecord"
	WHERE ${Prisma.join(conditions, ' AND ')}
	GROUP BY
		"counterpartyBeneficiaryId"
	HAVING
		-- All transactions greather than the last days
		count(*) > count(id) FILTER (WHERE "transactionDate" BETWEEN ${historicalTransactionClause} AND ${recentDaysClause})
		AND count(id) FILTER (WHERE "transactionDate" > ${recentDaysClause}) > ${minimumCount}
		AND count(id) FILTER (WHERE "transactionDate" < ${historicalTransactionClause}) >= 1
)
SELECT
	a."counterpartyBeneficiaryId" as "counterpartyBeneficiaryId",
	a.allTransactionsCount,
	a.activeDaysTransactions,
	a.lastTransactionsCount,
	(a.lastTransactionsCount - a.activeDaysTransactions) / 59 AS "withoutFactor",
	((a.lastTransactionsCount - a.activeDaysTransactions) / 59) * ${transactionFactor} AS "withFactor"
FROM
	allTransactions as a
WHERE (a.lastTransactionsCount - a.activeDaysTransactions) / 59 > 0
AND a.activeDaysTransactions > ((a.lastTransactionsCount - a.activeDaysTransactions) / 59) * ${transactionFactor};`,
    );
  }

  async evaluateMultipleMerchantsOneCounterparty({
    projectId,
    timeUnit,
    timeAmount,
    minimumCount,
    excludedCounterparty,
  }: TMultipleMerchantsOneCounterparty) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"tr"."projectId" = ${projectId}`,
      Prisma.sql`"tr"."counterpartyOriginatorId" IS NOT NULL`,
      Prisma.sql`"cpOriginator"."correlationId" LIKE '%****%'`,
      Prisma.sql`"tr"."transactionDate" <= NOW()`,
      !!timeAmount &&
        !!timeUnit &&
        Prisma.sql`"tr"."transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
          `${timeAmount} ${timeUnit}`,
        )}'`,
    ].filter(Boolean);

    const { excludedCounterpartyWhereClause, excludedCounterpartyClause } =
      this._buildExcludedCounterpartyClause(excludedCounterparty);

    const join = [COUNTERPARTY_ORIGINATOR_JOIN_CLAUSE, ...excludedCounterpartyClause.join];

    const uniqueJoinMap = new Map(join.map(item => [item.sql, item]));
    const uniqueJoinClause = [...uniqueJoinMap.values()];

    return await this._executeQuery<Array<{ counterpartyId: string }>>(
      Prisma.sql`
      SELECT
        "tr"."counterpartyOriginatorId" as "counterpartyOriginatorId",
        COUNT(distinct "tr"."counterpartyBeneficiaryId") as "counterpertyInManyBusinessesCount"
      FROM
        "TransactionRecord" as "tr" ${Prisma.join(uniqueJoinClause, '\n ')}
      WHERE
        ${Prisma.join(
          [...conditions, excludedCounterpartyWhereClause].filter(cond => cond != Prisma.empty),
          ' AND ',
        )}
      GROUP BY
        "tr"."counterpartyOriginatorId"
      HAVING COUNT(distinct "tr"."counterpartyBeneficiaryId") > ${minimumCount};
      `,
    );
  }

  async evaluateMerchantGroupAverage({
    projectId,
    customerType,
    timeAmount,
    timeUnit,
    transactionFactor,
    minimumCount,
    paymentMethod,
  }: TMerchantGroupAverage) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const recentDaysClause = Prisma.sql`"tr"."transactionDate" >= CURRENT_DATE - INTERVAL '${Prisma.raw(
      `${timeAmount} ${timeUnit}`,
    )}'`;

    const transactionsOverAllTimeClause = Prisma.sql`"tr"."transactionDate" < CURRENT_DATE - INTERVAL '${Prisma.raw(
      `${timeAmount} ${timeUnit}`,
    )}'`;

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"tr"."projectId" = ${projectId}`,
      Prisma.sql`"tr"."paymentMethod"::text ${Prisma.raw(paymentMethod.operator)} ${
        paymentMethod.value
      }`,
      !!customerType && Prisma.sql`b."businessType" = ${customerType}`,
      Prisma.sql`"tr"."transactionDate" <= NOW()`,
    ].filter(Boolean);

    const sqlQuery = Prisma.sql`WITH tx_by_business AS
    (SELECT "tr"."counterpartyBeneficiaryId" as "counterpartyBeneficiaryId",
            "b"."businessType",
            COUNT("tr".id) FILTER (
                                   WHERE ${transactionsOverAllTimeClause}) AS "transactionCount",
            COUNT("tr".id) FILTER (
                                   WHERE ${recentDaysClause}) AS "recentDaysTransactionCount"
     FROM "TransactionRecord" AS "tr"
     JOIN "Counterparty" AS "cp" ON "tr"."counterpartyBeneficiaryId" = "cp".id
     JOIN "Business" AS "b" ON "cp"."businessId" = "b".id
     WHERE ${Prisma.join(conditions, ' AND ')}
     GROUP BY "tr"."counterpartyBeneficiaryId",
              "b"."businessType"
     HAVING -- "transactionCount" > "recentDaysTransactionCount"
   COUNT("tr".id) FILTER (
                          WHERE tr."transactionDate" < CURRENT_DATE - INTERVAL '7 days') > COUNT("tr".id) FILTER (
                                                                                                                  WHERE tr."transactionDate" >= CURRENT_DATE - INTERVAL '7 days')),
       avg_business AS
    (SELECT "businessType",
            SUM("recentDaysTransactionCount") AS "totalTransactionsCount",
            COUNT(DISTINCT "counterpartyBeneficiaryId") AS "merchantCount"
     FROM tx_by_business
     WHERE "recentDaysTransactionCount" > ${minimumCount}
     GROUP BY "businessType"
     HAVING COUNT(*) > 1
     AND SUM("recentDaysTransactionCount") > 1)
  SELECT t."counterpartyBeneficiaryId",
         t."businessType",
         t."transactionCount",
         t."recentDaysTransactionCount",
         (avg_business."totalTransactionsCount" - t."recentDaysTransactionCount")::FLOAT / (avg_business."merchantCount" - 1) AS avg_tx_excluding_current
  FROM tx_by_business t
  JOIN avg_business ON t."businessType" = avg_business."businessType"
  WHERE
   t."recentDaysTransactionCount" > ${transactionFactor} * ((avg_business."totalTransactionsCount" - t."recentDaysTransactionCount")::FLOAT / (avg_business."merchantCount" - 1));`;

    return await this._executeQuery<Array<{ counterpartyId: string }>>(sqlQuery);
  }

  async evaluateDailySingleTransactionAmount({
    projectId,

    ruleType,
    amountThreshold,

    timeUnit,
    timeAmount,

    direction,

    paymentMethods,
    excludePaymentMethods,

    transactionType = [],
  }: DailySingleTransactionAmountType) {
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const startDate = calculateStartDate(timeUnit, timeAmount);
    startDate.setHours(0, 0, 0, 0);

    const conditions: Prisma.Sql[] = [
      Prisma.sql`"projectId" = ${projectId}`,
      Prisma.sql`"transactionDate" >= ${startDate}`,
      Prisma.sql`"transactionDate" <= NOW()`,
    ];

    if (!isEmpty(transactionType)) {
      conditions.push(
        Prisma.sql`"tr"."transactionType"::text IN (${Prisma.join([...transactionType], ',')})`,
      );
    }

    if (direction) {
      conditions.push(Prisma.sql`"transactionDirection"::text = ${direction}`);
    }

    if (!isEmpty(paymentMethods)) {
      const methodCondition = excludePaymentMethods ? `NOT IN` : `IN`;

      conditions.push(
        Prisma.sql`"paymentMethod"::text ${Prisma.raw(methodCondition)} (${Prisma.join([
          ...paymentMethods,
        ])})`,
      );
    }

    let query: Prisma.Sql;

    if (ruleType === 'amount') {
      conditions.push(Prisma.sql`"transactionBaseAmount" > ${amountThreshold}`);

      query = Prisma.sql`SELECT "counterpartyBeneficiaryId" FROM "TransactionRecord" "tr" WHERE ${Prisma.join(
        conditions,
        ' AND ',
      )} GROUP BY "counterpartyBeneficiaryId"`;
    } else if (ruleType === 'count') {
      query = Prisma.sql`SELECT "counterpartyBeneficiaryId",
         COUNT(id) AS "transactionCount" FROM "TransactionRecord" "tr" WHERE ${Prisma.join(
           conditions,
           ' AND ',
         )} GROUP BY "counterpartyBeneficiaryId" HAVING ${Prisma.raw(
        `${AggregateType.COUNT}(id)`,
      )} > ${amountThreshold}`;
    } else {
      throw new Error(`Invalid rule type: ${ruleType}`);
    }

    return await this._executeQuery<Array<Record<string, unknown>>>(query);
  }

  private async _executeQuery<T = unknown>(query: Prisma.Sql) {
    this.logger.log('Executing query...\n', {
      query: query.sql,
      values: query.values,
    });

    return await this.prisma.$queryRaw<T>(query);
  }
}
