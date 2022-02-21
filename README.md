# move-issue-card-action
This action lets you move a project card tied to an issue from one column to another.

## Inputs
| Name         | Default                          | Description                                    |
|--------------|----------------------------------|------------------------------------------------|
| to-column    | "To do"                          | The column the project card will be moved to   |
| from-column  | "In progress"                    | The column the project card will be moved from |
| issue-number | ${{github.context.issue.number}} | The issue for which a card will be looked up   |

The action will only complete if there exists a card tied to the issue identified by `issue-number` and that both `from-column` and `to-column` are columns in the project the card exists in. The project itself is inferred by the card query performed by the action.

## Usage
### Move a card tied to issue #1 from `To do` to `In progress`
```yml
      - name: Move a project card
        uses: pants007/move-issue-card-action@master
        with:
          to-column: "In progress"
          from-column: "To do"
          issue-number: 1
```
This will move the card tied to issue #`1` from `"To do"` to `"In progress"`, if the conditions described above are met.