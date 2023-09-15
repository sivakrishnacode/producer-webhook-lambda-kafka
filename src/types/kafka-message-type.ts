interface KafkaMessageType {
  topic: string;
  partition: number;
  offset: number;
}

export default KafkaMessageType;
