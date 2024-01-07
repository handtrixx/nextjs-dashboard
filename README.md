## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

# Minor Issues

On preparing producctive deplyoment by command "npm run build", I receive error:

```
./app/ui/invoices/edit-form.tsx:23:29
Type error: Cannot find name 'useFormState'.

  21 |   const initialState = { message: null, errors: {} };
  22 |   const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
> 23 |   const [state, dispatch] = useFormState(updateInvoiceWithId, initialState);
     |                             ^
  24 |
  25 |   return <form action={dispatch}></form>;
  26 | }
   Linting and checking validity of types  ...%

```
To fix this add
```
import { useFormState } from 'react-dom';
```
to file "./app/ui/invoices/edit-form.tsx" on top after the other imports.