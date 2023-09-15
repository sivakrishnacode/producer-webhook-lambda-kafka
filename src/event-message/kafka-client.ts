import { ClientKafka } from '@nestjs/microservices';
import { Logger, OnApplicationShutdown } from '@nestjs/common';
import { get as _get, reduce as _reduce } from 'lodash';
// import { KafkaOptions } from './types';
import {
  Consumer,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  KafkaJSNonRetriableError,
  KafkaMessage,
  Message,
  Partitioners,
  Producer,
} from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import KafkaMessageType from '../types/kafka-message-type';

import { logLevel } from '@nestjs/microservices/external/kafka.interface';
export class KafkaClient implements OnApplicationShutdown {
  private client: any;
  private config: ConfigService;
  private consumer: Consumer;
  private kafkaClient: ClientKafka;
  private producer: Producer;

  constructor(options: any) {
    this.config = new ConfigService();
    this.kafkaClient = new ClientKafka({
      ...options,
      logLevel: logLevel.ERROR,
    });
    this.client = this.client ?? this.kafkaClient.createClient();
    this.producer =
      this.producer ??
      this.client.producer({
        allowAutoTopicCreation: false,
        createPartitioner: Partitioners.LegacyPartitioner,
      });
  }

  public async createConsumer(groupId: string) {
    return await this.client.consumer({
      groupId,
    });
  }

  //  consume message under a topic
  public async consume<T>(
    topics: ConsumerSubscribeTopics[] | ConsumerSubscribeTopics,
    groupId: string,
    onBatch: (events: (T & KafkaMessageType)[]) => Promise<T[] | void>,
  ) {
    try {
      this.consumer =
        this.consumer ??
        (await this.createConsumer(groupId).catch((error: any) => {
          throw error;
        }));
      if (this.consumer) {
        await this.consumer.connect().catch((error: any) => {
          throw error;
        });
        if (Array.isArray(topics)) {
          Promise.all(
            topics.map(
              async (topic) =>
                await this.consumer.subscribe(topic).catch((error: any) => {
                  throw error;
                }),
            ),
          );
        } else {
          this.consumer.subscribe(topics).catch((error: any) => {
            throw error;
          });
        }
        await this.consumer.run({
          eachBatchAutoResolve: true,
          eachBatch: async (batchPayload: EachBatchPayload) => {
            await this.pauseConsumer(batchPayload.batch.topic);
            const transformedEvents = _reduce(
              _get(batchPayload, 'batch.messages', []),
              (events: (T & KafkaMessageType)[], event: KafkaMessage) => {
                events.push({
                  ...JSON.parse(event.value.toString()),
                  offset: event.offset,
                  topic: batchPayload.batch.topic,
                  partition: batchPayload.batch.partition,
                });
                return events;
              },
              [] as (T & KafkaMessageType)[],
            );
            await onBatch(transformedEvents);
            await this.commit<T>(transformedEvents);
            await this.resumeConsumer(batchPayload.batch.topic);
          },
        });
      }
    } catch (error) {
      if (error instanceof KafkaJSNonRetriableError) {
        Logger.warn(
          { message: 'Retrying for KafkaJSNonRetriableError' },
          'ClientKafka',
        );
        // Retry the consumption
        await this.consume(topics, groupId, onBatch);
      } else {
        Logger.error(
          { message: 'Error when subscribing', error: error },
          'ClientKafka',
        );
      }
    }
  }

  // produce message under the topic
  public async produce(
    topics: string[] | string,
    messageToSend: object,
    key: string,
  ): Promise<void> {
    try {
      await this.producer.connect().catch((error: any) => {
        throw error;
      });
      const message: Message = {
        value: JSON.stringify(messageToSend),
        timestamp: String(Date.now()),
        key: key,
      };
      if (Array.isArray(topics)) {
        Promise.all(
          topics.map(async (topic) => {
            await this.producer.send({
              topic: topic,
              messages: Array(message),
            });
          }),
        );
      } else {
        await this.producer
          .send({
            topic: topics,
            messages: Array(message),
          })
          .catch((error: any) => {
            throw error;
          });
      }
    } catch (error) {
      console.log('Error in Kafka Producer ', error);
      throw error;
    }
  }

  protected async pauseConsumer(topic: string): Promise<void> {
    this.consumer.pause([
      {
        topic: topic,
      },
    ]);
  }

  protected async resumeConsumer(topic: string): Promise<void> {
    setTimeout(
      () => {
        this.consumer.resume([
          {
            topic: topic,
          },
        ]);
      },
      Number(this.config.get('kafka.CONSUMER.DELAY_IN_SECONDS', 0) * 1000),
    );
  }

  public async commit<T>(events: (T & KafkaMessageType)[]) {
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      await this.consumer.commitOffsets([
        {
          topic: event.topic,
          partition: event.partition,
          offset: String(Number(event.offset) + 1),
        },
      ]);
    }
  }

  onApplicationShutdown(signal?: string) {
    try {
      Logger.log('Disconnecting kafka producer', 'KafkaClient');
      this.producer.disconnect();
      Logger.log('Disconnecting kafka consumer', 'KafkaClient');
      this.consumer.disconnect();
      Logger.log('Closing kafka', 'KafkaClient');
      this.kafkaClient.close();
    } catch (error: any) {
      Logger.error(error, 'KafkaClient');
    }
  }
}
