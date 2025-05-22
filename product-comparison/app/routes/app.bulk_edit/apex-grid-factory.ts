import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { ApexGrid } from 'apex-grid';

export const ReactApexGrid = createComponent({
    tagName: 'apex-grid',
    elementClass: ApexGrid,
    react: React,
    events: {},
}); 