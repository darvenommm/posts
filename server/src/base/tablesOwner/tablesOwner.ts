export abstract class TablesOwner {
  public abstract create(): Promise<void>;
  public abstract clean(): Promise<void>;
}
