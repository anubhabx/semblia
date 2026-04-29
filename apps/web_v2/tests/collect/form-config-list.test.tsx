import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormConfigList } from "@/components/collect/form-config-list";
import { useStudioStore } from "@/lib/collect/studio-store";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("<FormConfigList />", () => {
  beforeEach(() => {
    pushMock.mockReset();
    useStudioStore.setState({
      formsByProject: {},
      snapshots: {},
      device: "desktop",
    });
  });

  it("creates the default form without sync external store snapshot warnings", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<FormConfigList slug="launchpad" />);

    expect(await screen.findByText("Default Form")).not.toBeNull();

    const consoleOutput = errorSpy.mock.calls
      .flatMap((args) => args.map(String))
      .join("\n");

    expect(consoleOutput).not.toContain(
      "The result of getSnapshot should be cached",
    );
    expect(consoleOutput).not.toContain(
      "The result of getServerSnapshot should be cached",
    );
  });
});
