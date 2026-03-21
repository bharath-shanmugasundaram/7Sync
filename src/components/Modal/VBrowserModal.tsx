import React from "react";
import { Modal, Button, Table, Alert, Select, Avatar } from "@mantine/core";
import { serverPath } from "../../utils/utils";
import config from "../../config";
import { MetadataContext } from "../../MetadataContext";
import { IconHourglass } from "@tabler/icons-react";

export class VBrowserModal extends React.Component<{
  closeModal: () => void;
  startVBrowser: (options: { size: string; region: string }) => void;
}> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state = {
    isFreePoolFull: false,
    region: "any",
  };

  async componentDidMount() {
    const resp = await fetch(serverPath + "/metadata");
    const metadata = await resp.json();
    this.setState({ isFreePoolFull: metadata.isFreePoolFull });
  }
  render() {
    const regionOptions = [
      { label: "Any available", value: "any", image: { avatar: false, src: "" } },
      { label: "US East", value: "US", image: { avatar: false, src: "/flag-united-states.png" } },
      { label: "US West", value: "USW", image: { avatar: false, src: "/flag-united-states.png" } },
      { label: "Europe", value: "EU", image: { avatar: false, src: "/flag-european-union.png" } },
    ];
    const { closeModal, startVBrowser } = this.props;
    const LaunchButton = ({ large }: { large: boolean }) => {
      return (
        <Button
          color={large ? "orange" : undefined}
          onClick={async () => {
            startVBrowser({
              size: large ? "large" : "",
              region: this.state.region === "any" ? "" : this.state.region,
            });
            closeModal();
          }}
        >
          {large ? "Launch VBrowser+" : "Launch VBrowser"}
        </Button>
      );
    };
    const vmPoolFullMessage = (
      <Alert style={{ maxWidth: "300px" }} color="red" icon={<IconHourglass />} title="No Free VBrowsers Available">
        <div>All of the free VBrowsers are currently being used. Please try again later.</div>
      </Alert>
    );

    return (
      <Modal opened onClose={closeModal} title="Launch a VBrowser" centered size="auto">
        <div>You're about to launch a virtual browser to share in this room.</div>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Free</Table.Th>
              <Table.Th>Plus</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr><Table.Td>Max Resolution</Table.Td><Table.Td>720p</Table.Td><Table.Td>1080p</Table.Td></Table.Tr>
            <Table.Tr><Table.Td>CPU/RAM</Table.Td><Table.Td>Standard</Table.Td><Table.Td>Extra</Table.Td></Table.Tr>
            <Table.Tr><Table.Td>Session Length</Table.Td><Table.Td>3 hours</Table.Td><Table.Td>24 hours</Table.Td></Table.Tr>
            <Table.Tr><Table.Td>Max Viewers</Table.Td><Table.Td>15</Table.Td><Table.Td>30</Table.Td></Table.Tr>
            <Table.Tr>
              <Table.Td>Region</Table.Td>
              <Table.Td>Where available</Table.Td>
              <Table.Td>
                <Select
                  onChange={(value) => this.setState({ region: value })}
                  value={this.state.region}
                  data={regionOptions}
                  renderOption={({ option }: { option: any }) => (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Avatar radius="xs" src={option.image.src} />
                      {option.label}
                    </div>
                  )}
                />
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td></Table.Td>
              <Table.Td>
                {this.state.isFreePoolFull ? vmPoolFullMessage : <LaunchButton large={false} />}
              </Table.Td>
              <Table.Td>
                <LaunchButton large />
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Modal>
    );
  }
}
