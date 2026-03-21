import React from "react";
import { Modal, Button, Table } from "@mantine/core";

export const FileShareModal = (props: {
  closeModal: () => void;
  startFileShare: (useMediaSoup: boolean) => void;
  startConvert: () => void;
}) => {
  const { closeModal } = props;
  return (
    <Modal opened onClose={closeModal} title="Share a file" size="auto" centered>
      <div>You're about to share a file from your device.</div>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Direct</Table.Th>
            <Table.Th>Relay</Table.Th>
            <Table.Th>Convert</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Method</Table.Td>
            <Table.Td>Stream from your device to each viewer.</Table.Td>
            <Table.Td>Stream via relay server reducing bandwidth.</Table.Td>
            <Table.Td>Convert in real-time for maximum compatibility.</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Latency</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`~5s`}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Max Viewers</Table.Td>
            <Table.Td>5</Table.Td>
            <Table.Td>20</Table.Td>
            <Table.Td>100</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td></Table.Td>
            <Table.Td>
              <Button onClick={() => { props.startFileShare(false); props.closeModal(); }}>
                Start Fileshare
              </Button>
            </Table.Td>
            <Table.Td>
              <Button color="orange" onClick={() => { props.startFileShare(true); props.closeModal(); }}>
                Start w/Relay
              </Button>
            </Table.Td>
            <Table.Td>
              <Button color="orange" onClick={() => { props.startConvert(); props.closeModal(); }}>
                Start w/Convert
              </Button>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Modal>
  );
};
