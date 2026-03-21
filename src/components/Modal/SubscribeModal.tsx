import React from "react";
import { Modal } from "@mantine/core";

// SubscribeModal is no longer needed — all features are unlocked by default in 7sync.
export class SubscribeModal extends React.Component<{
  closeSubscribe: () => void;
}> {
  render() {
    return (
      <Modal
        opened
        onClose={this.props.closeSubscribe}
        centered
        title="7sync"
      >
        <div>All features are available for free.</div>
      </Modal>
    );
  }
}
