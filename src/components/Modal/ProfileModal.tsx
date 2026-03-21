import React from "react";
import { Modal } from "@mantine/core";

// ProfileModal is no longer needed — Firebase auth removed in 7sync.
export class ProfileModal extends React.Component<{
  close: () => void;
  userImage: string | null;
}> {
  render() {
    return (
      <Modal opened onClose={this.props.close} centered>
        <div style={{ textAlign: "center", padding: "20px" }}>
          Profile management is not available in 7sync.
        </div>
      </Modal>
    );
  }
}
