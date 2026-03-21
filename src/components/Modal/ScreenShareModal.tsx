import React from "react";
import { Modal, Button, Table } from "@mantine/core";

export const ScreenShareModal = ({
  closeModal,
  startScreenShare,
}: {
  closeModal: () => void;
  startScreenShare: (useMediaSoup: boolean) => void;
}) => {
  return (
    <Modal opened={true} onClose={closeModal} title="Share your screen" centered size="auto">
      <div>You're about to share your screen.</div>
      <ul>
        <li>This feature is only supported on Chrome and Edge on desktop.</li>
        <li>Audio sharing only works if sharing your entire screen or a browser tab, not an application.</li>
      </ul>
      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Direct</Table.Th>
            <Table.Th>Relay</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Method</Table.Td>
            <Table.Td>Stream from your device to each viewer.</Table.Td>
            <Table.Td>Stream via relay server reducing bandwidth.</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Latency</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
            <Table.Td>{`<1s`}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Max Viewers</Table.Td>
            <Table.Td>5</Table.Td>
            <Table.Td>20</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td></Table.Td>
            <Table.Td>
              <Button onClick={() => { startScreenShare(false); closeModal(); }}>
                Start Screenshare
              </Button>
            </Table.Td>
            <Table.Td>
              <Button color="orange" onClick={() => { startScreenShare(true); closeModal(); }}>
                Start w/Relay
              </Button>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Modal>
  );
};
